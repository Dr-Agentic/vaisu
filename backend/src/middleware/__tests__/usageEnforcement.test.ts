import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkAnalysisLimit, checkStorageLimit } from "../usageEnforcement.js";
import { usageLimitsRepository } from "../../repositories/usageLimitsRepository.js";
import * as documentRepository from "../../repositories/documentRepository.js";

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
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      user: {
        userId: "user1",
        role: "free",
      },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  describe("checkAnalysisLimit", () => {
    it("should call next if under limit", async () => {
      (usageLimitsRepository.getDailyUsage as any).mockResolvedValue({
        analysisCount: 0,
      });

      await checkAnalysisLimit(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 403 if limit exceeded", async () => {
      (usageLimitsRepository.getDailyUsage as any).mockResolvedValue({
        analysisCount: 10,
      }); // Free limit is 5

      await checkAnalysisLimit(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Daily analysis limit exceeded" }),
      );
    });
  });

  describe("checkStorageLimit", () => {
    it("should call next if under limit", async () => {
      (documentRepository.countByUserId as any).mockResolvedValue(10);

      await checkStorageLimit(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 403 if document count exceeded", async () => {
      (documentRepository.countByUserId as any).mockResolvedValue(25); // Free limit is 20

      await checkStorageLimit(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Document storage limit exceeded" }),
      );
    });
  });
});
