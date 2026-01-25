import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAnalysisLimit, checkStorageLimit } from "../usageEnforcement.js";
import { usageLimitsRepository } from "../../repositories/usageLimitsRepository.js";
import * as documentRepository from "../../repositories/documentRepository.js";
import { Request, Response } from "express";

// Mock repositories
vi.mock("../../repositories/usageLimitsRepository.js", () => ({
  usageLimitsRepository: {
    getDailyUsage: vi.fn(),
  },
}));

vi.mock("../../repositories/documentRepository.js", () => ({
  countByUserId: vi.fn(),
}));

describe("Usage Enforcement Middleware", () => {
  let mockReq: any;
  let mockRes: Partial<Response>;
  let next: any;

  beforeEach(() => {
    mockReq = {
      user: {
        userId: "test-user",
        subscriptionStatus: "inactive", // Default to FREE
      } as any,
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  describe("checkAnalysisLimit", () => {
    it("calls next() if under limit (Free tier)", async () => {
      // Mock daily usage < 5
      (usageLimitsRepository.getDailyUsage as any).mockResolvedValue({
        analysisCount: 4,
      });

      await checkAnalysisLimit(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("returns 403 if limit exceeded (Free tier)", async () => {
      // Mock daily usage >= 5
      (usageLimitsRepository.getDailyUsage as any).mockResolvedValue({
        analysisCount: 5,
      });

      await checkAnalysisLimit(mockReq as Request, mockRes as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Daily analysis limit exceeded",
        }),
      );
    });

    it("allows higher limit for PRO users", async () => {
      mockReq.user = {
        userId: "pro-user",
        subscriptionStatus: "active",
      } as any;

      // Mock daily usage > 5 but < 100
      (usageLimitsRepository.getDailyUsage as any).mockResolvedValue({
        analysisCount: 50,
      });

      await checkAnalysisLimit(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("returns 401 if no user", async () => {
      mockReq.user = undefined;
      await checkAnalysisLimit(mockReq as Request, mockRes as Response, next);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });

  describe("checkStorageLimit", () => {
    it("calls next() if under limit (Free tier)", async () => {
      // Mock total docs < 10
      (documentRepository.countByUserId as any).mockResolvedValue(9);

      await checkStorageLimit(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("returns 403 if limit exceeded (Free tier)", async () => {
      // Mock total docs >= 10
      (documentRepository.countByUserId as any).mockResolvedValue(10);

      await checkStorageLimit(mockReq as Request, mockRes as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Storage limit exceeded (maximum documents reached)",
        }),
      );
    });

    it("allows higher limit for PRO users", async () => {
      mockReq.user = {
        userId: "pro-user",
        subscriptionStatus: "active",
      } as any;

      // Mock total docs > 10 but < 1000
      (documentRepository.countByUserId as any).mockResolvedValue(500);

      await checkStorageLimit(mockReq as Request, mockRes as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
