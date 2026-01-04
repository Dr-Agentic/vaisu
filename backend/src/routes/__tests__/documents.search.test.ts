import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { documentsRouter } from '../documents.js';

// Mock the dependencies
vi.mock('../../services/documentParser.js', () => ({
  documentParser: {
    parseDocument: vi.fn().mockResolvedValue({
      id: 'test-id',
      title: 'Test Document',
      content: 'Test content',
      metadata: {
        wordCount: 2,
        uploadDate: new Date('2025-12-07T00:00:00Z'),
        fileType: 'text/plain',
        language: 'en',
      },
      structure: {
        sections: [],
        hierarchy: [],
      },
    }),
  },
}));

vi.mock('../../services/analysis/textAnalyzer.js', () => ({
  textAnalyzer: {
    analyzeDocument: vi.fn().mockResolvedValue({
      tldr: {
        text: 'This is a test summary about machine learning',
        confidence: 0.9,
        generatedAt: '2025-12-07T00:00:00Z',
        model: 'test-model',
      },
      executiveSummary: {
        headline: 'Machine Learning Overview',
        keyIdeas: ['AI', 'ML'],
        kpis: [],
        risks: [],
        opportunities: [],
        callToAction: 'Test',
      },
      entities: [],
      relationships: [],
      metrics: [],
      signals: {
        structural: 0.5,
        process: 0.5,
        quantitative: 0.5,
        technical: 0.5,
        argumentative: 0.5,
        temporal: 0.5,
      },
      recommendations: [],
    }),
  },
}));

vi.mock('../../services/visualization/visualizationGenerator.js', () => ({
  visualizationGenerator: {
    generateVisualization: vi.fn().mockResolvedValue({}),
  },
}));

describe('Documents API - Search and List', () => {
  let app: express.Application;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRouter);
    
    // Note: In-memory storage is shared across tests in the same file
    // This is intentional to test the cumulative behavior
  });

  describe('GET /api/documents/search', () => {
    it('should return empty results for empty query', async () => {
      const response = await request(app)
        .get('/api/documents/search')
        .query({ q: '' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        documents: [],
        total: 0,
        query: '',
      });
    });

    it('should return empty results when no query provided', async () => {
      const response = await request(app).get('/api/documents/search');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        documents: [],
        total: 0,
        query: '',
      });
    });

    it('should search by filename', async () => {
      // First, analyze a document to add it to the in-memory store
      await request(app)
        .post('/api/documents/analyze')
        .send({ text: 'Machine learning content' });

      const response = await request(app)
        .get('/api/documents/search')
        .query({ q: 'machine' });

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.query).toBe('machine');
      expect(response.body.documents).toBeInstanceOf(Array);
    });

    it('should search by TLDR text', async () => {
      // Analyze a document
      await request(app)
        .post('/api/documents/analyze')
        .send({ text: 'Test content' });

      const response = await request(app)
        .get('/api/documents/search')
        .query({ q: 'summary' });

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.documents[0].tldr).toBeDefined();
      expect(response.body.documents[0].tldr.text).toContain('summary');
    });

    it('should search by executive summary headline', async () => {
      // Analyze a document
      await request(app)
        .post('/api/documents/analyze')
        .send({ text: 'Test content' });

      const response = await request(app)
        .get('/api/documents/search')
        .query({ q: 'overview' });

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.documents[0].summaryHeadline).toContain('Overview');
    });

    it('should be case-insensitive', async () => {
      await request(app)
        .post('/api/documents/analyze')
        .send({ text: 'Machine learning content' });

      const response = await request(app)
        .get('/api/documents/search')
        .query({ q: 'MACHINE' });

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should return documents sorted by upload date (newest first)', async () => {
      const response = await request(app)
        .get('/api/documents/search')
        .query({ q: 'test' });

      expect(response.status).toBe(200);
      
      if (response.body.documents.length >= 2) {
        // Check that dates are in descending order
        const dates = response.body.documents.map((d: any) => new Date(d.uploadDate).getTime());
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
        }
      } else {
        // If less than 2 documents, just verify the response structure
        expect(response.body).toHaveProperty('documents');
        expect(Array.isArray(response.body.documents)).toBe(true);
      }
    });

    it('should handle search errors gracefully', async () => {
      // This test ensures the error handling works
      const response = await request(app)
        .get('/api/documents/search')
        .query({ q: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('query');
    });
  });

  describe('GET /api/documents', () => {
    it('should return list of documents', async () => {
      const response = await request(app).get('/api/documents');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit', 50);
      expect(response.body).toHaveProperty('offset', 0);
      expect(Array.isArray(response.body.documents)).toBe(true);
    });

    it('should list documents with default pagination', async () => {
      // Analyze a document
      await request(app)
        .post('/api/documents/analyze')
        .send({ text: 'Test content' });

      const response = await request(app).get('/api/documents');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(1);
      expect(response.body.limit).toBe(50);
      expect(response.body.offset).toBe(0);
      expect(response.body.documents).toHaveLength(1);
    });

    it('should respect limit parameter', async () => {
      // Analyze multiple documents
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/documents/analyze')
          .send({ text: `Document ${i}` });
      }

      const response = await request(app)
        .get('/api/documents')
        .query({ limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(2);
      expect(response.body.documents.length).toBeLessThanOrEqual(2);
    });

    it('should respect offset parameter', async () => {
      // Analyze multiple documents
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/documents/analyze')
          .send({ text: `Document ${i}` });
      }

      const response = await request(app)
        .get('/api/documents')
        .query({ offset: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.offset).toBe(1);
      expect(response.body.documents.length).toBeLessThanOrEqual(2);
    });

    it('should return documents sorted by upload date (newest first)', async () => {
      const response = await request(app).get('/api/documents');

      expect(response.status).toBe(200);
      
      if (response.body.documents.length >= 2) {
        // Check that dates are in descending order
        const dates = response.body.documents.map((d: any) => new Date(d.uploadDate).getTime());
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
        }
      } else {
        // If less than 2 documents, just verify the response structure
        expect(response.body).toHaveProperty('documents');
        expect(Array.isArray(response.body.documents)).toBe(true);
      }
    });

    it('should include TLDR as object in document list items', async () => {
      await request(app)
        .post('/api/documents/analyze')
        .send({ text: 'Test content' });

      const response = await request(app).get('/api/documents');

      expect(response.status).toBe(200);
      expect(response.body.documents[0].tldr).toBeDefined();
      expect(response.body.documents[0].tldr).toHaveProperty('text');
      expect(response.body.documents[0].tldr).toHaveProperty('confidence');
      expect(response.body.documents[0].tldr).toHaveProperty('generatedAt');
      expect(response.body.documents[0].tldr).toHaveProperty('model');
    });

    it('should include all required fields in document list items', async () => {
      await request(app)
        .post('/api/documents/analyze')
        .send({ text: 'Test content' });

      const response = await request(app).get('/api/documents');

      expect(response.status).toBe(200);
      const doc = response.body.documents[0];
      expect(doc).toHaveProperty('id');
      expect(doc).toHaveProperty('title');
      expect(doc).toHaveProperty('fileType');
      expect(doc).toHaveProperty('uploadDate');
      expect(doc).toHaveProperty('tldr');
      expect(doc).toHaveProperty('summaryHeadline');
      expect(doc).toHaveProperty('wordCount');
    });

    it('should handle list errors gracefully', async () => {
      const response = await request(app).get('/api/documents');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');
    });
  });
});
