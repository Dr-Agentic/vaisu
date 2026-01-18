import { Request, Response, NextFunction } from 'express';
import { userRepository } from '../repositories/userRepository.js';
import { sessionRepository } from '../repositories/sessionRepository.js';
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
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify access token
    const payload = authUtils.verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user exists
    const user = await userRepository.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Attach user to request
    req.user = {
      userId: user.userId,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
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

    // TODO: Implement role checking when roles are added
    // For now, just check if user exists
    const user = await userRepository.getUserById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
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

    // Check if user is admin or accessing their own data
    const user = await userRepository.getUserById(req.user.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // TODO: Implement admin role check when roles are added
    // For now, only allow self access
    if (req.user.userId !== targetUserId) {
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
