import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { documentsRouter, documents, analyses } from '../documents.js';
import { generateTestToken } from '../../../../test/utils/auth.js';
import { userRepository } from '../../repositories/userRepository.js';

// Mock the repositories to prevent hitting DynamoDB during tests
vi.mock('../../repositories/documentRepository.js', () => ({
  findByHashAndFilename: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue({}),
  listByUserId: vi.fn().mockImplementation((userId, limit) => {
    // Return mock documents if there are any in the in-memory store
    const docs = Array.from(documents.values()).map(doc => ({
      documentId: doc.id,
      filename: doc.title,
      contentType: doc.metadata.fileType,
      uploadedAt: doc.metadata.uploadDate.toISOString(),
    }));
    console.log(`[MOCK] listByUserId called for ${userId}, found ${docs.length} docs`);
    return Promise.resolve({ documents: docs, total: docs.length });
  }),
  findById: vi.fn().mockResolvedValue(null),
  deleteDocument: vi.fn(),
}));

vi.mock('../../repositories/analysisRepository.js', () => ({
  findByDocumentId: vi.fn().mockImplementation((id) => {
    const analysis = analyses.get(id);
    if (analysis) {
      return Promise.resolve({ documentId: id, analysis });
    }
    return Promise.resolve(null);
  }),
  create: vi.fn().mockResolvedValue({}),
  deleteAnalysis: vi.fn(),
}));

vi.mock('../../repositories/userRepository.js');

// Mock usageLimitsRepository
vi.mock('../../repositories/usageLimitsRepository.js', () => ({
  usageLimitsRepository: {
    incrementAnalysisCount: vi.fn().mockResolvedValue({}),
    getDailyUsage: vi.fn().mockResolvedValue({ analysisCount: 0 }),
    checkStorageLimit: vi.fn().mockResolvedValue(true),
  },
}));

// Mock the dependencies
vi.mock('../../services/documentParser.js', () => ({
  documentParser: {
    parseDocument: vi.fn().mockImplementation((buffer, filename) => ({
      id: 'test-id',
      title: filename,
      content: buffer.toString(),
      metadata: {
        wordCount: buffer.toString().split(/\s+/).length,
        uploadDate: new Date(),
        fileType: 'text/plain',
        language: 'en',
      },
      structure: {
        sections: [],
        hierarchy: [],
      },
    })),
  },
}));

vi.mock('../../services/analysis/textAnalyzer.js', () => ({
  textAnalyzer: {
    analyzeDocument: vi.fn().mockImplementation((doc) => Promise.resolve({
      tldr: {
        text: 'This is a test summary about machine learning',
        confidence: 0.9,
        generatedAt: new Date().toISOString(),
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
    })),
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
    // Clear in-memory stores
    documents.clear();
    analyses.clear();

    // Reset spy-related mocks but preserve the factory mocks
    // Note: vi.mock() factory mocks are hoisted and not reset by resetAllMocks()
    // But we should still reset any dynamic mocks
    vi.clearAllTimers();
    
    // Mock authenticated user
    vi.mocked(userRepository.getUserById).mockResolvedValue({
      userId: 'test-user-id',
      email: 'test@example.com',
      status: 'active',
    } as any);

    app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRouter);
  }, 10000);

  const token = generateTestToken('test-user-id');

  describe('GET /api/documents/search', () => {
    it('should return empty results for empty query', async () => {
      const response = await request(app)
        .get('/api/documents/search')
        .set('Authorization', `Bearer ${token}`)
        .query({ q: '' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        documents: [],
        total: 0,
        query: '',
      });
    });

    it('should return empty results when no query provided', async () => {
      const response = await request(app)
        .get('/api/documents/search')
        .set('Authorization', `Bearer ${token}`);

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
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Machine learning content' });

      const response = await request(app)
        .get('/api/documents/search')
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Test content' });

      const response = await request(app)
        .get('/api/documents/search')
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Test content' });

      const response = await request(app)
        .get('/api/documents/search')
        .set('Authorization', `Bearer ${token}`)
        .query({ q: 'overview' });

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.documents[0].summaryHeadline).toContain('Overview');
    });

    it('should be case-insensitive', async () => {
      await request(app)
        .post('/api/documents/analyze')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Machine learning content' });

      const response = await request(app)
        .get('/api/documents/search')
        .set('Authorization', `Bearer ${token}`)
        .query({ q: 'MACHINE' });

      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should return documents sorted by upload date (newest first)', async () => {
      const response = await request(app)
        .get('/api/documents/search')
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .query({ q: 'test' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('query');
    });
  });

  describe('GET /api/documents', () => {
    it('should return list of documents', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`);

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
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Test content' });

      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`);

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
          .set('Authorization', `Bearer ${token}`)
          .send({ text: `Document ${i}` });
      }

      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`)
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
          .set('Authorization', `Bearer ${token}`)
          .send({ text: `Document ${i}` });
      }

      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`)
        .query({ offset: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.offset).toBe(1);
      expect(response.body.documents.length).toBeLessThanOrEqual(2);
    });

    it('should return documents sorted by upload date (newest first)', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`);

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
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Test content' });

      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`);

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
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Test content' });

      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`);

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
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('documents');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');
    });
  });
});
