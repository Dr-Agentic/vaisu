import { Request, Response, NextFunction } from 'express';

import { sessionRepository } from '../repositories/sessionRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { authUtils } from '../utils/auth.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
  session?: {
    sessionId: string;
  };
}

// Extract token from Authorization header
function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

// Authentication middleware
export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      console.warn(`[${new Date().toISOString()}] Auth: No token provided for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify access token
    const payload = authUtils.verifyAccessToken(token);
    if (!payload) {
      console.warn(`[${new Date().toISOString()}] Auth: Invalid or expired token for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user exists
    let user;
    try {
      user = await userRepository.getUserById(payload.userId);
    } catch (dbError) {
      console.error(`[${new Date().toISOString()}] Auth: Database error looking up user ${payload.userId}:`, dbError);
      return res.status(500).json({ error: 'Internal server error during authentication' });
    }

    if (!user) {
      console.warn(`[${new Date().toISOString()}] Auth: User not found for ID ${payload.userId}`);
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if account is active
    if (user.status !== 'active') {
      console.warn(`[${new Date().toISOString()}] Auth: Account ${user.userId} is ${user.status}`);
      return res.status(403).json({ error: `Account is ${user.status.replace('_', ' ')}` });
    }

    // Attach user to request
    req.user = {
      userId: user.userId,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Auth: Unexpected error:`, error);
    res.status(500).json({ error: 'Authentication failed due to an unexpected error' });
  }
}

// Optional authentication middleware (allows unauthenticated requests)
export async function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      // No token provided, continue without authentication
      return next();
    }

    // Verify access token
    const payload = authUtils.verifyAccessToken(token);
    if (!payload) {
      // Invalid token, continue without authentication
      return next();
    }

    // Check if user exists
    const user = await userRepository.getUserById(payload.userId);
    if (!user) {
      return next();
    }

    // Attach user to request
    req.user = {
      userId: user.userId,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
}

// Role-based access control middleware
export function requireRole(roles: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await userRepository.getUserById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.role || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }

    next();
  };
}

// Admin-only middleware
export const requireAdmin = requireRole(['admin']);

// Self or admin middleware (allows user to access their own data or admin to access any)
export function requireSelfOrAdmin(paramName: string = 'userId') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const targetUserId = req.params[paramName] || req.body[paramName];
    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID required' });
    }

    const user = await userRepository.getUserById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Allow if user is admin or accessing their own data
    const isAdmin = user.role === 'admin';
    const isSelf = req.user.userId === targetUserId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
}

// Rate limiting middleware (basic implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(windowMs: number = 15 * 60 * 1000, max: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();

    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (entry.count >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    } else {
      entry.count++;
    }

    next();
  };
}

// Login rate limiting (stricter)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export function loginRateLimit(windowMs: number = 15 * 60 * 1000, max: number = 5) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();

    const entry = loginAttempts.get(ip);

    if (!entry || now > entry.resetTime) {
      loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (entry.count >= max) {
      return res.status(429).json({
        error: 'Too many login attempts',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    } else {
      entry.count++;
    }

    next();
  };
}

// Clean up old rate limit entries (run periodically)
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
  for (const [ip, entry] of loginAttempts.entries()) {
    if (now > entry.resetTime) {
      loginAttempts.delete(ip);
    }
  }
}
