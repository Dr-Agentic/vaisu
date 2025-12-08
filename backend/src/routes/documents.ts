import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { documentParser } from '../services/documentParser.js';
import { textAnalyzer } from '../services/analysis/textAnalyzer.js';
import { visualizationGenerator } from '../services/visualization/visualizationGenerator.js';
import { calculateContentHash } from '../utils/hash.js';
import { isPersistenceEnabled } from '../config/aws.js';
import * as documentRepository from '../repositories/documentRepository.js';
import * as analysisRepository from '../repositories/analysisRepository.js';
import * as s3Storage from '../services/storage/s3Storage.js';
import type { Document, DocumentAnalysis } from '../../../shared/src/types.js';
import type { DocumentRecord, AnalysisRecord } from '../repositories/types.js';

const router = Router();

// CORS middleware
router.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  
  next();
});

// Store for progress tracking with partial results
interface ProgressInfo {
  step: string;
  progress: number;
  message: string;
  partialAnalysis?: Partial<DocumentAnalysis>;
}
const progressStore = new Map<string, ProgressInfo>();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1GB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(txt|pdf|docx)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .txt, .pdf, and .docx files are allowed.'));
    }
  }
});

// In-memory storage (replace with database in production)
const documents = new Map<string, Document>();
const analyses = new Map<string, DocumentAnalysis>();
const visualizations = new Map<string, any>();

// Helper to create document list item
function toDocumentListItem(doc: Document): any {
  const analysis = analyses.get(doc.id);
  return {
    id: doc.id,
    title: doc.title,
    fileType: doc.metadata.fileType,
    uploadDate: doc.metadata.uploadDate,
    tldr: analysis?.tldr,
    summaryHeadline: analysis?.executiveSummary?.headline,
    wordCount: doc.metadata.wordCount
  };
}

// POST /api/documents/upload
router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 1GB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    let document: Document;

    if (req.file) {
      // File upload
      document = await documentParser.parseDocument(req.file.buffer, req.file.originalname);
    } else if (req.body.text) {
      // Text input
      const buffer = Buffer.from(req.body.text, 'utf-8');
      document = await documentParser.parseDocument(buffer, 'pasted-text.txt');
    } else {
      return res.status(400).json({ error: 'No file or text provided' });
    }

    documents.set(document.id, document);

    res.json({
      documentId: document.id,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload document' });
  }
});

// POST /api/documents/analyze
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { documentId, text } = req.body;

    let document: Document | undefined;
    let buffer: Buffer | undefined;
    let filename: string;

    if (documentId) {
      document = documents.get(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
      buffer = Buffer.from(document.content, 'utf-8');
      filename = document.title;
    } else if (text) {
      // Analyze text directly
      buffer = Buffer.from(text, 'utf-8');
      filename = 'direct-text.txt';
      document = await documentParser.parseDocument(buffer, filename);
      documents.set(document.id, document);
    } else {
      return res.status(400).json({ error: 'No documentId or text provided' });
    }

    const startTime = Date.now();
    
    // Check cache if persistence is enabled
    if (isPersistenceEnabled() && buffer) {
      try {
        const contentHash = calculateContentHash(buffer.toString('utf-8'));
        console.log(`🔍 Checking cache for hash: ${contentHash.substring(0, 8)}... filename: ${filename}`);
        
        const cachedDoc = await documentRepository.findByHashAndFilename(contentHash, filename);
        
        if (cachedDoc) {
          console.log(`✅ Cache HIT! Document ID: ${cachedDoc.documentId}`);
          
          // Retrieve cached analysis
          const cachedAnalysis = await analysisRepository.findByDocumentId(cachedDoc.documentId);
          
          if (cachedAnalysis) {
            // Update access metadata
            await documentRepository.updateAccessMetadata(cachedDoc.documentId);
            
            const processingTime = Date.now() - startTime;
            
            // Store in memory for this session
            documents.set(cachedDoc.documentId, document);
            analyses.set(cachedDoc.documentId, cachedAnalysis.analysis);
            
            return res.json({
              documentId: cachedDoc.documentId,
              document,
              analysis: cachedAnalysis.analysis,
              processingTime,
              cached: true
            });
          }
        } else {
          console.log(`❌ Cache MISS - will analyze and store`);
        }
      } catch (cacheError) {
        console.error('Cache lookup error (continuing with analysis):', cacheError);
        // Continue with analysis if cache fails
      }
    }
    
    // Progress callback to send updates with partial results
    const onProgress = (
      step: string, 
      progress: number, 
      message: string,
      partialAnalysis?: Partial<DocumentAnalysis>
    ) => {
      console.log(`[${document.id}] ${progress}% - ${message}`);
      progressStore.set(document.id, { step, progress, message, partialAnalysis });
    };
    
    const analysis = await textAnalyzer.analyzeDocument(document, onProgress);
    const processingTime = Date.now() - startTime;

    // Clear progress and store analysis
    progressStore.delete(document.id);
    analyses.set(document.id, analysis);
    document.analysis = analysis;

    // Store in DynamoDB + S3 if persistence is enabled
    if (isPersistenceEnabled() && buffer) {
      try {
        const contentHash = calculateContentHash(buffer.toString('utf-8'));
        const newDocumentId = uuidv4();
        
        console.log(`💾 Storing document in S3 and DynamoDB...`);
        
        // Upload to S3
        const s3Result = await s3Storage.uploadDocument(contentHash, filename, buffer);
        
        // Store document metadata
        const documentRecord: DocumentRecord = {
          documentId: newDocumentId,
          userId: '1', // Default anonymous user
          contentHash,
          filename,
          s3Path: s3Result.path,
          s3Bucket: s3Result.bucket,
          s3Key: s3Result.key,
          contentType: document.metadata.fileType,
          fileSize: buffer.length,
          uploadedAt: new Date().toISOString(),
          lastAccessedAt: new Date().toISOString(),
          accessCount: 1,
        };
        
        await documentRepository.create(documentRecord);
        
        // Store analysis
        const analysisRecord: AnalysisRecord = {
          documentId: newDocumentId,
          analysisVersion: 'v1.0',
          analysis,
          llmMetadata: {
            model: 'anthropic/claude-3.7-sonnet', // TODO: Get from actual LLM call
            tokensUsed: 0, // TODO: Track actual tokens
            processingTime,
            timestamp: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
        };
        
        await analysisRepository.create(analysisRecord);
        
        console.log(`✅ Document stored with ID: ${newDocumentId}`);
        
        return res.json({
          documentId: newDocumentId,
          document,
          analysis,
          processingTime,
          cached: false
        });
      } catch (storageError) {
        console.error('Storage error (returning analysis anyway):', storageError);
        // Return analysis even if storage fails
      }
    }

    res.json({
      documentId: document.id,
      document,
      analysis,
      processingTime,
      cached: false
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze document' });
  }
});

// GET /api/documents/search - Search documents (must be before /:id route)
router.get('/search', (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string || '').toLowerCase().trim();
    
    if (!query) {
      return res.json({ documents: [], total: 0, query: '' });
    }
    
    // Search in filename, tldr, and summary
    const matchingDocs = Array.from(documents.values())
      .filter(doc => {
        const analysis = analyses.get(doc.id);
        const titleMatch = doc.title.toLowerCase().includes(query);
        // TLDR is now an object with a text field
        const tldrMatch = analysis?.tldr?.text?.toLowerCase().includes(query);
        const summaryMatch = analysis?.executiveSummary?.headline?.toLowerCase().includes(query);
        
        return titleMatch || tldrMatch || summaryMatch;
      })
      .sort((a, b) => new Date(b.metadata.uploadDate).getTime() - new Date(a.metadata.uploadDate).getTime());
    
    const documentList = matchingDocs.map(toDocumentListItem);
    
    res.json({
      documents: documentList,
      total: matchingDocs.length,
      query
    });
  } catch (error: any) {
    console.error('Search documents error:', error);
    res.status(500).json({ error: error.message || 'Failed to search documents' });
  }
});

// GET /api/documents/:id
router.get('/:id', (req: Request, res: Response) => {
  const document = documents.get(req.params.id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const analysis = analyses.get(req.params.id);

  res.json({
    document,
    analysis
  });
});

// POST /api/documents/:id/visualizations/:type
router.post('/:id/visualizations/:type', async (req: Request, res: Response) => {
  try {
    const { id, type } = req.params;
    console.log(`📊 Visualization request: type=${type}, documentId=${id}`);
    console.log(`📦 In-memory documents: ${documents.size} items`);

    let document = documents.get(id);
    let analysis = analyses.get(id);

    // If not in memory, try loading from DynamoDB
    if (!document && isPersistenceEnabled()) {
      console.log(`🔍 Document not in memory, checking DynamoDB...`);
      try {
        const docRecord = await documentRepository.findById(id);
        const analysisRecord = await analysisRepository.findByDocumentId(id);
        
        if (docRecord && analysisRecord) {
          console.log(`✅ Found in DynamoDB: ${docRecord.filename}`);
          
          // Load content from S3 if needed
          const contentBuffer = await s3Storage.downloadDocument(docRecord.s3Key);
          const content = contentBuffer.toString('utf-8');
          
          // Reconstruct document
          document = {
            id: docRecord.documentId,
            title: docRecord.filename,
            content,
            metadata: {
              fileType: docRecord.contentType,
              uploadDate: new Date(docRecord.uploadedAt),
              wordCount: content.split(/\s+/).length,
              language: 'en',
            },
            structure: analysisRecord.analysis.structure,
          };
          
          analysis = analysisRecord.analysis;
          
          // Cache in memory for future requests
          documents.set(id, document);
          if (analysis) {
            analyses.set(id, analysis);
          }
          
          // Update access metadata
          await documentRepository.updateAccessMetadata(id);
        }
      } catch (dbError) {
        console.error('DynamoDB lookup error:', dbError);
      }
    }

    if (!document) {
      console.log(`❌ Document ${id} not found in memory or DynamoDB`);
      return res.status(404).json({ error: 'Document not found' });
    }
    console.log(`✅ Using document: ${document.title}`);

    // Structured view doesn't need analysis, others do
    if (!analysis && type !== 'structured-view') {
      return res.status(404).json({ error: 'Document not analyzed yet. Analysis required for this visualization.' });
    }

    const vizKey = `${id}-${type}`;
    
    // Check cache
    if (visualizations.has(vizKey)) {
      return res.json({
        type,
        data: visualizations.get(vizKey),
        cached: true
      });
    }

    // Generate visualization (analysis may be undefined for structured-view)
    const data = await visualizationGenerator.generateVisualization(
      type as any,
      document,
      analysis as any
    );

    visualizations.set(vizKey, data);

    res.json({
      type,
      data,
      cached: false
    });
  } catch (error: any) {
    console.error('Visualization error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate visualization' });
  }
});

// GET /api/documents/:id/progress - Get analysis progress
router.get('/:id/progress', (req: Request, res: Response) => {
  const { id } = req.params;
  const progress = progressStore.get(id);
  
  if (progress) {
    res.json(progress);
  } else {
    res.json({ step: 'complete', progress: 100, message: 'Analysis complete or not started' });
  }
});

// GET /api/documents/:id/full - Get document with all data
router.get('/:id/full', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Try DynamoDB first if persistence is enabled
    if (isPersistenceEnabled()) {
      try {
        const docRecord = await documentRepository.findById(id);
        const analysisRecord = await analysisRepository.findByDocumentId(id);
        
        if (docRecord && analysisRecord) {
          // Update access metadata
          await documentRepository.updateAccessMetadata(id);
          
          // Reconstruct Document object from DynamoDB record
          const document: Document = {
            id: docRecord.documentId,
            title: docRecord.filename,
            content: '', // Content is in S3, not loaded here
            metadata: {
              fileType: docRecord.contentType,
              uploadDate: new Date(docRecord.uploadedAt),
              wordCount: 0, // Not stored in DynamoDB
              language: 'en', // Default language
            },
            structure: analysisRecord.analysis.structure,
          };
          
          // Extract visualizations from analysis if they exist
          const docVisualizations: Record<string, any> = {};
          // Visualizations are stored in the analysis object
          // For now, return empty visualizations as they're generated on-demand
          
          return res.json({
            document,
            analysis: analysisRecord.analysis,
            visualizations: docVisualizations
          });
        }
      } catch (dbError) {
        console.error('DynamoDB fetch error (falling back to memory):', dbError);
        // Fall through to in-memory storage
      }
    }
    
    // Fallback to in-memory storage
    const document = documents.get(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const analysis = analyses.get(id);
    
    // Collect all cached visualizations for this document
    const docVisualizations: Record<string, any> = {};
    for (const [key, data] of visualizations.entries()) {
      if (key.startsWith(`${id}-`)) {
        const vizType = key.substring(id.length + 1);
        docVisualizations[vizType] = data;
      }
    }
    
    res.json({
      document,
      analysis,
      visualizations: docVisualizations
    });
  } catch (error: any) {
    console.error('Get full document error:', error);
    res.status(500).json({ error: error.message || 'Failed to get document' });
  }
});

// GET /api/documents - List all documents (must be last to not conflict with other routes)
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // If persistence is enabled, fetch from DynamoDB
    if (isPersistenceEnabled()) {
      try {
        console.log('📋 Fetching documents from DynamoDB...');
        const userId = '1'; // Default anonymous user
        const result = await documentRepository.listByUserId(userId, limit);
        
        // Fetch analyses for each document
        const documentList = await Promise.all(
          result.documents.map(async (docRecord) => {
            const analysisRecord = await analysisRepository.findByDocumentId(docRecord.documentId);
            
            return {
              id: docRecord.documentId,
              title: docRecord.filename,
              fileType: docRecord.contentType,
              uploadDate: docRecord.uploadedAt,
              tldr: analysisRecord?.analysis?.tldr,
              summaryHeadline: analysisRecord?.analysis?.executiveSummary?.headline,
              wordCount: 0, // Not stored in DynamoDB record
            };
          })
        );
        
        console.log(`✅ Found ${documentList.length} documents in DynamoDB`);
        
        return res.json({
          documents: documentList,
          total: documentList.length,
          limit,
          offset: 0,
        });
      } catch (dbError) {
        console.error('DynamoDB fetch error (falling back to memory):', dbError);
        // Fall through to in-memory storage
      }
    }
    
    // Fallback to in-memory storage
    const allDocs = Array.from(documents.values())
      .sort((a, b) => new Date(b.metadata.uploadDate).getTime() - new Date(a.metadata.uploadDate).getTime());
    
    const total = allDocs.length;
    const paginatedDocs = allDocs.slice(offset, offset + limit);
    const documentList = paginatedDocs.map(toDocumentListItem);
    
    res.json({
      documents: documentList,
      total,
      limit,
      offset
    });
  } catch (error: any) {
    console.error('List documents error:', error);
    res.status(500).json({ error: error.message || 'Failed to list documents' });
  }
});

export default router;
export { router as documentsRouter };
