import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { documentParser } from '../services/documentParser.js';
import { textAnalyzer } from '../services/analysis/textAnalyzer.js';
import { visualizationGenerator } from '../services/visualization/visualizationGenerator.js';
import type { Document, DocumentAnalysis } from '../../../shared/src/types.js';

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
    fileSize: 10 * 1024 * 1024 // 10MB
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

// POST /api/documents/upload
router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
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

    if (documentId) {
      document = documents.get(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }
    } else if (text) {
      // Analyze text directly
      const buffer = Buffer.from(text, 'utf-8');
      document = await documentParser.parseDocument(buffer, 'direct-text.txt');
      documents.set(document.id, document);
    } else {
      return res.status(400).json({ error: 'No documentId or text provided' });
    }

    const startTime = Date.now();
    
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

    res.json({
      document,
      analysis,
      processingTime
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze document' });
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

    const document = documents.get(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Structured view doesn't need analysis, others do
    const analysis = analyses.get(id);
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
      analysis!
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

export default router;
export { router as documentsRouter };
