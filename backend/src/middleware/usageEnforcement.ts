import { Request, Response, NextFunction } from "express";
import { usageLimitsRepository } from "../repositories/usageLimitsRepository.js";
import * as documentRepository from "../repositories/documentRepository.js";

// Limits - could be moved to config or user role based
const LIMITS = {
  free: {
    dailyAnalysis: 5,
    maxDocuments: 20,
  },
  pro: {
    dailyAnalysis: 100,
    maxDocuments: 1000,
  },
};

export const checkAnalysisLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const role = (user.role as "free" | "pro") || "free";
    const limit = LIMITS[role]?.dailyAnalysis || LIMITS.free.dailyAnalysis;

    const dailyUsage = await usageLimitsRepository.getDailyUsage(user.userId);
    const currentCount = dailyUsage?.analysisCount || 0;

    if (currentCount >= limit) {
      return res.status(403).json({
        error: "Daily analysis limit exceeded",
        limit,
        current: currentCount,
      });
    }

    next();
  } catch (error) {
    console.error("Usage check error:", error);
    next(error);
  }
};

export const checkStorageLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    if (!user || !user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const role = (user.role as "free" | "pro") || "free";
    const limit = LIMITS[role]?.maxDocuments || LIMITS.free.maxDocuments;

    // Check count
    const count = await documentRepository.countByUserId(user.userId);

    if (count >= limit) {
      return res.status(403).json({
        error: "Document storage limit exceeded",
        limit,
        current: count,
      });
    }

    next();
  } catch (error) {
    console.error("Storage check error:", error);
    next(error);
  }
};
