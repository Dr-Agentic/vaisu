import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeAll, vi } from 'vitest';

import { documentsRouter } from '../documents';
import { visualizationGenerator } from '../../services/visualization/visualizationGenerator';
import { visualizationService } from '../../repositories/visualizationService';
import * as documentRepository from '../../repositories/documentRepository';
import * as analysisRepository from '../../repositories/analysisRepository';

// Mock repositories and services
vi.mock('../../repositories/documentRepository.js', () => ({
  findById: vi.fn(),
  updateAccessMetadata: vi.fn(),
  create: vi.fn(),
  findByHashAndFilename: vi.fn(),
  listByUserId: vi.fn(),
}));

vi.mock('../../repositories/analysisRepository.js', () => ({
  findByDocumentId: vi.fn(),
  create: vi.fn(),
}));

vi.mock('../../repositories/visualizationService.js', () => ({
  visualizationService: {
    findByDocumentIdAndType: vi.fn(),
    findByDocumentId: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../services/visualization/visualizationGenerator.js', () => ({
  visualizationGenerator: {
    generateVisualization: vi.fn(),
  },
}));

vi.mock('../../services/storage/s3Storage.js', () => ({
  uploadDocument: vi.fn(),
  downloadDocument: vi.fn(),
}));

describe('Visualizations API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/documents', documentsRouter);
  });

  const mockDocId = 'test-doc-id';
  const mockDoc = {
    id: mockDocId,
    title: 'test.txt',
    content: 'test content',
    metadata: {
      fileType: 'text/plain',
      uploadDate: new Date().toISOString(),
      wordCount: 10,
    },
    structure: {
      sections: [],
    },
  };

  const mockAnalysis = {
    tldr: { text: 'test tldr' },
    executiveSummary: { headline: 'test summary' },
  };

  describe('POST /api/documents/:id/visualizations/:type', () => {
    it('should generate visualization successfully', async () => {
      // Mock document and analysis retrieval
      vi.mocked(documentRepository.findById).mockResolvedValue({
        documentId: mockDocId,
        filename: 'test.txt',
        s3Key: 'key',
        // other fields...
      } as any);
      
      vi.mocked(analysisRepository.findByDocumentId).mockResolvedValue({
        analysis: mockAnalysis,
      } as any);

      // Mock S3 download
      const { downloadDocument } = await import('../../services/storage/s3Storage.js');
      vi.mocked(downloadDocument).mockResolvedValue(Buffer.from('test content'));

      // Mock generator
      const mockVizData = { terms: [{ term: 'A', definition: 'B' }] };
      vi.mocked(visualizationGenerator.generateVisualization).mockResolvedValue(mockVizData);

      const response = await request(app)
        .post(`/api/documents/${mockDocId}/visualizations/terms-definitions`)
        .expect(200);

      expect(response.body).toEqual({
        type: 'terms-definitions',
        data: mockVizData,
        cached: false,
      });

      expect(visualizationGenerator.generateVisualization).toHaveBeenCalledWith(
        'terms-definitions',
        expect.anything(),
        mockAnalysis,
        false
      );
    });

    it('should return 404 if document not found', async () => {
      vi.mocked(documentRepository.findById).mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/documents/non-existent/visualizations/terms-definitions`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Document not found');
    });
  });

  describe('GET /api/documents/:id/visualizations/:type', () => {
    it('should retrieve existing visualization', async () => {
      const mockVizData = { terms: [{ term: 'A', definition: 'B' }] };
      vi.mocked(visualizationService.findByDocumentIdAndType).mockResolvedValue({
        visualizationType: 'terms-definitions',
        visualizationData: mockVizData,
        llmMetadata: { model: 'gpt-4' },
      } as any);

      const response = await request(app)
        .get(`/api/documents/${mockDocId}/visualizations/terms-definitions`)
        .expect(200);

      expect(response.body).toEqual({
        type: 'terms-definitions',
        data: mockVizData,
        cached: true,
        metadata: { model: 'gpt-4' },
      });
    });

    it('should return 404 if visualization not found', async () => {
      vi.mocked(visualizationService.findByDocumentIdAndType).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/documents/${mockDocId}/visualizations/non-existent`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/documents/:id/visualizations', () => {
    it('should retrieve all visualizations for a document', async () => {
      const mockVizList = [
        {
          visualizationType: 'terms-definitions',
          visualizationData: { terms: [] },
          llmMetadata: { model: 'gpt-4' },
        },
        {
          visualizationType: 'mind-map',
          visualizationData: { root: {} },
          llmMetadata: { model: 'gpt-4' },
        },
      ];
      vi.mocked(visualizationService.findByDocumentId).mockResolvedValue(mockVizList as any);

      const response = await request(app)
        .get(`/api/documents/${mockDocId}/visualizations`)
        .expect(200);

      expect(response.body.documentId).toBe(mockDocId);
      expect(response.body.count).toBe(2);
      expect(response.body.visualizations).toHaveProperty('terms-definitions');
      expect(response.body.visualizations).toHaveProperty('mind-map');
    });
  });
});
