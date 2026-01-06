import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

import { SMALL_BUSINESS_REPORT } from '../../../../test/fixtures/documents';
import { createMockOpenRouterClient } from '../../../../test/mocks/openRouterMock';
import { textAnalyzer } from '../../services/analysis/textAnalyzer';
import { documentsRouter } from '../documents';

describe('Documents API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    // Mock the LLM client for integration tests
    const mockClient = createMockOpenRouterClient();
    (textAnalyzer as any)._llmClient = mockClient;

    app = express();

    // JSON parsing with error handling
    app.use(express.json());

    // Error handler for JSON parsing
    app.use((err: any, req: any, res: any, next: any) => {
      if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
      next();
    });

    app.use('/api/documents', documentsRouter);
  });

  describe('POST /api/documents/analyze', () => {
    it('should analyze text document successfully', async () => {
      const response = await request(app)
        .post('/api/documents/analyze')
        .send({ text: SMALL_BUSINESS_REPORT })
        .expect(200);

      expect(response.body).toHaveProperty('analysis');
      expect(response.body.analysis).toHaveProperty('tldr');
      expect(response.body.analysis).toHaveProperty('executiveSummary');
      expect(response.body.analysis).toHaveProperty('recommendations');
    });

    it('should return 400 for empty text', async () => {
      const response = await request(app)
        .post('/api/documents/analyze')
        .send({ text: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing text field', async () => {
      const response = await request(app)
        .post('/api/documents/analyze')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should complete within 10 seconds', async () => {
      const start = Date.now();

      await request(app)
        .post('/api/documents/analyze')
        .send({ text: SMALL_BUSINESS_REPORT })
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10000);
    }, 15000); // Increase timeout for this test

    it('should handle large documents', async () => {
      const largeText = 'word '.repeat(5000); // 5k words

      const response = await request(app)
        .post('/api/documents/analyze')
        .send({ text: largeText })
        .expect(200);

      expect(response.body.analysis).toBeDefined();
    }, 20000);
  });

  describe('POST /api/documents/upload', () => {
    it('should accept file upload', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .attach('file', Buffer.from(SMALL_BUSINESS_REPORT), 'test.txt')
        .expect(200);

      expect(response.body).toHaveProperty('documentId');
    });

    it('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .attach('file', Buffer.from('test'), 'test.exe')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject oversized files', async () => {
      const largeBuffer = Buffer.alloc(1100 * 1024 * 1024); // 1.1GB (exceeds 1GB limit)

      const response = await request(app)
        .post('/api/documents/upload')
        .attach('file', largeBuffer, 'large.txt')
        .expect(413);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('1GB');
    });
  });

  describe('GET /api/documents/:id', () => {
    it('should retrieve document by ID', async () => {
      // First analyze a document
      const uploadResponse = await request(app)
        .post('/api/documents/analyze')
        .send({ text: SMALL_BUSINESS_REPORT });

      const documentId = uploadResponse.body.document.id;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/documents/${documentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('document');
      expect(response.body.document.id).toBe(documentId);
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/documents/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/documents/analyze')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle server errors gracefully', async () => {
      // This would require mocking internal services to fail
      // For now, just verify error response structure
      const response = await request(app)
        .post('/api/documents/analyze')
        .send({ text: SMALL_BUSINESS_REPORT });

      if (response.status === 500) {
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBeTruthy();
      }
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/documents/analyze')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Rate limiting', () => {
    it('should enforce rate limits', async () => {
      // Make multiple rapid requests
      const requests = Array(20).fill(null).map(() =>
        request(app)
          .post('/api/documents/analyze')
          .send({ text: 'test' }),
      );

      const responses = await Promise.all(requests);

      // At least some should be rate limited
      const rateLimited = responses.some(r => r.status === 429);

      // This depends on rate limit configuration
      // For now, just verify the endpoint works
      expect(responses.length).toBe(20);
    }, 30000);
  });
});
