import express from "express";
import request from "supertest";
import { describe, it, expect, beforeAll, vi, beforeEach } from "vitest";

// Mock dependencies BEFORE importing the router
vi.mock("../../middleware/auth", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: "test-user", email: "test@example.com", role: "user" };
    next();
  },
  AuthenticatedRequest: {},
}));

vi.mock("../../repositories/usageLimitsRepository", () => ({
  usageLimitsRepository: {
    getDailyUsage: vi.fn(),
    incrementAnalysisCount: vi.fn(),
  },
}));

vi.mock("../../repositories/documentRepository", () => ({
  countByUserId: vi.fn(),
  findById: vi.fn(),
  findByHashAndFilename: vi.fn(),
  create: vi.fn(),
  updateAccessMetadata: vi.fn(),
  getStatsByUserId: vi.fn(),
  listByUserId: vi.fn(),
}));

vi.mock("../../repositories/analysisRepository", () => ({
  findByDocumentId: vi.fn(),
  create: vi.fn(),
}));

vi.mock("../../repositories/visualizationService", () => ({
  visualizationService: {
    findByDocumentId: vi.fn(),
    findByDocumentIdAndType: vi.fn(),
  },
}));

vi.mock("../../services/analysis/textAnalyzer", () => ({
  textAnalyzer: {
    analyzeDocument: vi.fn().mockResolvedValue({
      tldr: { text: "summary" },
      executiveSummary: { headline: "headline" },
      metadata: { models: [], tokensUsed: 0 },
    }),
  },
}));

vi.mock("../../services/storage/s3Storage", () => ({
  uploadDocument: vi
    .fn()
    .mockResolvedValue({ key: "key", bucket: "bucket", path: "path" }),
  downloadDocument: vi.fn(),
}));

vi.mock("../../services/documentParser", () => ({
  documentParser: {
    parseDocument: vi.fn().mockResolvedValue({
      id: "doc-123",
      title: "test.txt",
      content: "some text",
      metadata: { fileType: "text/plain", wordCount: 10 },
    }),
  },
}));

// Import the router AFTER mocks
import { documentsRouter } from "../documents";
import { usageLimitsRepository } from "../../repositories/usageLimitsRepository";
import { countByUserId } from "../../repositories/documentRepository";

describe("Document Usage Limits", () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/documents", documentsRouter);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /analyze - Daily Limit", () => {
    it("should allow analysis when under limit", async () => {
      // Mock usage under limit (e.g. 0)
      vi.mocked(usageLimitsRepository.getDailyUsage).mockResolvedValue({
        analysisCount: 0,
      } as any);

      const response = await request(app)
        .post("/api/documents/analyze")
        .send({ text: "some text" });

      expect(response.status).toBe(200);
      // It should have incremented the count
      expect(usageLimitsRepository.incrementAnalysisCount).toHaveBeenCalledWith(
        "test-user",
      );
    });

    it("should reject analysis when over limit", async () => {
      // Mock usage over limit (limit is 5 for free tier)
      vi.mocked(usageLimitsRepository.getDailyUsage).mockResolvedValue({
        analysisCount: 5,
      } as any);

      const response = await request(app)
        .post("/api/documents/analyze")
        .send({ text: "some text" });

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/limit exceeded/i);
      // Should NOT have incremented
      expect(
        usageLimitsRepository.incrementAnalysisCount,
      ).not.toHaveBeenCalled();
    });
  });

  describe("POST /upload - Storage Limit", () => {
    it("should allow upload when under limit", async () => {
      // Mock doc count under limit (limit is 10 for free tier)
      vi.mocked(countByUserId).mockResolvedValue(5);

      const response = await request(app)
        .post("/api/documents/upload")
        .attach("file", Buffer.from("content"), "test.txt");

      expect(response.status).toBe(200);
    });

    it("should reject upload when over limit", async () => {
      // Mock doc count over limit
      vi.mocked(countByUserId).mockResolvedValue(10);

      const response = await request(app)
        .post("/api/documents/upload")
        .attach("file", Buffer.from("content"), "test.txt");

      expect(response.status).toBe(403);
      expect(response.body.error).toMatch(/limit exceeded/i);
    });
  });
});
