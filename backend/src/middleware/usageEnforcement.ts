import { Request, Response, NextFunction } from 'express';

import { countByUserId } from '../repositories/documentRepository.js';
import { usageLimitsRepository } from '../repositories/usageLimitsRepository.js';

// Extend Request to include user
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role?: string;
    subscriptionStatus?: string;
  };
}

// Limits configuration
const LIMITS = {
  FREE: {
    dailyAnalysis: 5,
    totalDocuments: 10,
  },
  PRO: {
    dailyAnalysis: 100,
    totalDocuments: 1000,
  },
};

const getLimits = (req: AuthenticatedRequest) => {
  const user = req.user;
  const isPro
    = user?.subscriptionStatus === 'active'
    || user?.role === 'pro'
    || user?.role === 'admin';

  return isPro ? LIMITS.PRO : LIMITS.FREE;
};

export const checkAnalysisLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limits = getLimits(req);
    const dailyUsage = await usageLimitsRepository.getDailyUsage(userId);
    const currentCount = dailyUsage?.analysisCount || 0;

    if (currentCount >= limits.dailyAnalysis) {
      res.status(403).json({
        error: 'Daily analysis limit exceeded',
        details: {
          current: currentCount,
          limit: limits.dailyAnalysis,
          resetAt: 'tomorrow',
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking analysis limit:', error);
    res.status(500).json({ error: 'Internal server error checking limits' });
  }
};

export const checkStorageLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limits = getLimits(req);
    const totalDocs = await countByUserId(userId);

    if (totalDocs >= limits.totalDocuments) {
      res.status(403).json({
        error: 'Storage limit exceeded (maximum documents reached)',
        details: {
          current: totalDocs,
          limit: limits.totalDocuments,
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking storage limit:', error);
    res.status(500).json({ error: 'Internal server error checking limits' });
  }
};
