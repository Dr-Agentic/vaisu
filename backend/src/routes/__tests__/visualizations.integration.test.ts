import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

import { documentsRouter } from "../documents";
import { visualizationGenerator } from "../../services/visualization/visualizationGenerator";
import { visualizationService } from "../../repositories/visualizationService";
import * as documentRepository from "../../repositories/documentRepository";
import * as analysisRepository from "../../repositories/analysisRepository";
import * as s3Storage from "../../services/storage/s3Storage.js";
import { userRepository } from "../../repositories/userRepository.js";
import { generateTestToken } from "../../../../test/utils/auth";

// Mock repositories and services
vi.mock("../../repositories/documentRepository.js");
vi.mock("../../repositories/analysisRepository.js");
vi.mock("../../repositories/visualizationService.js", () => ({
  visualizationService: {
    findByDocumentIdAndType: vi.fn(),
    findByDocumentId: vi.fn(),
    create: vi.fn(),
    deleteVisualization: vi.fn(),
  },
}));
vi.mock("../../services/visualization/visualizationGenerator.js", () => ({
  visualizationGenerator: {
    generateVisualization: vi.fn(),
  },
}));
vi.mock("../../services/storage/s3Storage.js");
vi.mock("../../repositories/userRepository.js");

describe("Visualizations API Integration Tests", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/documents", documentsRouter);
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockDocId = "test-doc-id";
  const mockAnalysis = {
    tldr: { text: "test tldr" },
    executiveSummary: { headline: "test summary" },
  };

  // Helper function to mock authenticated user
  const mockAuthenticatedUser = (userId: string) => {
    vi.mocked(userRepository.getUserById).mockResolvedValue({
      userId: userId,
      email: `${userId}@example.com`,
      status: "active",
    } as any);
  };

  describe("POST /api/documents/:id/visualizations/:type", () => {
    it("should generate visualization successfully", async () => {
      const userId = "test-user-1";
      const token = generateTestToken(userId);
      mockAuthenticatedUser(userId);

      vi.mocked(documentRepository.findById).mockResolvedValue({
        documentId: mockDocId,
        filename: "test.txt",
        s3Key: "key",
        userId: userId,
      } as any);

      vi.mocked(analysisRepository.findByDocumentId).mockResolvedValue({
        analysis: mockAnalysis,
      } as any);

      const { downloadDocument } = await import("../../services/storage/s3Storage.js");
      vi.mocked(downloadDocument).mockResolvedValue(Buffer.from("test content"));

      const mockVizData = { terms: [{ term: "A", definition: "B" }] };
      vi.mocked(visualizationGenerator.generateVisualization).mockResolvedValue(mockVizData);

      const response = await request(app)
        .post(`/api/documents/${mockDocId}/visualizations/terms-definitions`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        type: "terms-definitions",
        data: mockVizData,
        cached: false,
      });

      expect(visualizationGenerator.generateVisualization).toHaveBeenCalledWith(
        "terms-definitions",
        expect.anything(),
        mockAnalysis,
        false,
      );
    });

    it("should generate entity graph visualization successfully", async () => {
      const userId = "test-user-2";
      const token = generateTestToken(userId);
      mockAuthenticatedUser(userId);

      vi.mocked(documentRepository.findById).mockResolvedValue({
        documentId: mockDocId,
        filename: "test.txt",
        s3Key: "key",
        userId: userId,
      } as any);

      vi.mocked(analysisRepository.findByDocumentId).mockResolvedValue({
        analysis: mockAnalysis,
      } as any);

      const { downloadDocument } = await import("../../services/storage/s3Storage.js");
      vi.mocked(downloadDocument).mockResolvedValue(Buffer.from("test content"));

      const mockVizData = {
        nodes: [{ id: "1", label: "Node", depth: 5 }],
        edges: [],
      };
      vi.mocked(visualizationGenerator.generateVisualization).mockResolvedValue(mockVizData);

      const response = await request(app)
        .post(`/api/documents/${mockDocId}/visualizations/entity-graph`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        type: "entity-graph",
        data: mockVizData,
        cached: false,
      });

      expect(visualizationGenerator.generateVisualization).toHaveBeenCalledWith(
        "entity-graph",
        expect.anything(),
        mockAnalysis,
        false,
      );
    });

    it("should return 404 if document not found", async () => {
      const userId = "test-user-3";
      const token = generateTestToken(userId);
      mockAuthenticatedUser(userId);

      vi.mocked(documentRepository.findById).mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/documents/non-existent/visualizations/terms-definitions`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Document not found");
    });

    it("should return 404 for unauthorized access", async () => {
      const userId1 = "test-user-1";
      const userId2 = "test-user-2";
      const token = generateTestToken(userId1);
      mockAuthenticatedUser(userId1);

      vi.mocked(documentRepository.findById).mockResolvedValue({
        documentId: mockDocId,
        filename: "test.txt",
        s3Key: "key",
        userId: userId2, // Different user
      } as any);

      const response = await request(app)
        .post(`/api/documents/${mockDocId}/visualizations/terms-definitions`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Document not found");
    });
  });

  describe("GET /api/documents/:id/visualizations/:type", () => {
    it("should retrieve existing visualization", async () => {
      const userId = "test-user-4";
      const token = generateTestToken(userId);
      mockAuthenticatedUser(userId);

      const mockVizData = { terms: [{ term: "A", definition: "B" }] };

      vi.mocked(documentRepository.findById).mockResolvedValue({
        documentId: mockDocId,
        userId: userId,
      } as any);

      vi.mocked(visualizationService.findByDocumentIdAndType).mockResolvedValue({
        visualizationType: "terms-definitions",
        visualizationData: mockVizData,
        llmMetadata: { model: "gpt-4" },
      } as any);

      const response = await request(app)
        .get(`/api/documents/${mockDocId}/visualizations/terms-definitions`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual({
        type: "terms-definitions",
        data: mockVizData,
        cached: true,
        metadata: { model: "gpt-4" },
      });

      expect(documentRepository.deleteDocument).not.toHaveBeenCalled();
    });

    it("should return 404 if visualization not found", async () => {
      const userId = "test-user-5";
      const token = generateTestToken(userId);
      mockAuthenticatedUser(userId);

      vi.mocked(documentRepository.findById).mockResolvedValue({
        documentId: mockDocId,
        userId: userId,
      } as any);

      vi.mocked(visualizationService.findByDocumentIdAndType).mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/documents/${mockDocId}/visualizations/non-existent`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 for unauthorized access", async () => {
      const userId1 = "test-user-1";
      const userId2 = "test-user-2";
      const token = generateTestToken(userId1);
      mockAuthenticatedUser(userId1);

      vi.mocked(documentRepository.findById).mockResolvedValue({
        documentId: mockDocId,
        userId: userId2, // Different user
      } as any);

      const response = await request(app)
        .get(`/api/documents/${mockDocId}/visualizations/non-existent`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Visualization not found");
    });
  });

  describe("GET /api/documents/:id/visualizations", () => {
    it("should retrieve all visualizations for a document", async () => {
      const userId = "test-user-6";
      const token = generateTestToken(userId);
      mockAuthenticatedUser(userId);

      const mockVizList = [
        {
          visualizationType: "terms-definitions",
          visualizationData: { terms: [] },
          llmMetadata: { model: "gpt-4" },
        },
        {
          visualizationType: "mind-map",
          visualizationData: { root: {} },
          llmMetadata: { model: "gpt-4" },
        },
      ];

      vi.mocked(documentRepository.findById).mockResolvedValue({
        documentId: mockDocId,
        userId: userId,
      } as any);

      vi.mocked(visualizationService.findByDocumentId).mockResolvedValue(mockVizList as any);

      const response = await request(app)
        .get(`/api/documents/${mockDocId}/visualizations`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.documentId).toBe(mockDocId);
      expect(response.body.count).toBe(2);
      expect(response.body.visualizations).toHaveProperty("terms-definitions");
      expect(response.body.visualizations).toHaveProperty("mind-map");

      expect(documentRepository.deleteDocument).not.toHaveBeenCalled();
    });

    it("should return 404 for unauthorized access", async () => {
      const userId1 = "test-user-1";
      const userId2 = "test-user-2";
      const token = generateTestToken(userId1);
      mockAuthenticatedUser(userId1);

      vi.mocked(documentRepository.findById).mockResolvedValue({
        documentId: mockDocId,
        userId: userId2, // Different user
      } as any);

      const response = await request(app)
        .get(`/api/documents/${mockDocId}/visualizations`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Visualizations not found");
    });
  });
});
