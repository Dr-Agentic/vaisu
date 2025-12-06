import { Router, Request, Response } from 'express';
import multer from 'multer';
import { documentParser } from '../services/documentParser.js';
import { textAnalyzer } from '../services/analysis/textAnalyzer.js';
import { visualizationGenerator } from '../services/visualization/visualizationGenerator.js';
import type { Document, DocumentAnalysis } from '../../../shared/src/types.js';

const router = Router();

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
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
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
      document: {
        id: document.id,
        title: document.title,
        metadata: document.metadata
      }
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

    let document: Document;

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
    const analysis = await textAnalyzer.analyzeDocument(document);
    const processingTime = Date.now() - startTime;

    // Store analysis
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

    const analysis = analyses.get(id);
    if (!analysis) {
      return res.status(404).json({ error: 'Document not analyzed yet' });
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

    // Generate visualization
    const data = await visualizationGenerator.generateVisualization(
      type as any,
      document,
      analysis
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

export default router;
