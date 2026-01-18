import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export interface JwtPayload {
  userId: string;
  email: string;
  sessionId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthUtils {
  private readonly jwtSecret = env.JWT_SECRET || 'your-secret-key-change-in-production';
  private readonly accessTokenExpiry = '15m'; // 15 minutes
  private readonly refreshTokenExpiry = '30d'; // 30 days

  // Password hashing with Argon2id
  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536, // 64MB
        timeCost: 3,
        parallelism: 1,
      });
      return hash;
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  // Verify password with Argon2id
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      return false;
    }
  }

  // Generate access token (short-lived)
  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'vaisu-auth',
    });
  }

  // Generate refresh token (long-lived)
  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'vaisu-auth',
    });
  }

  // Generate token pair
  generateTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  // Verify access token
  verifyAccessToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'vaisu-auth',
      });
      return decoded as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        issuer: 'vaisu-auth',
      });
      return decoded as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  // Generate email verification token
  generateVerificationToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  // Generate password reset token
  generateResetToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  // Generate token expiry (e.g., 24 hours from now)
  generateTokenExpiry(hours: number = 24): string {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + hours);
    return expiry.toISOString();
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!(/[A-Z]/).test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!(/[a-z]/).test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!(/[0-9]/).test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!(/[!@#$%^&*(),.?":{}|<>]/).test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Generate secure random string
  generateSecureRandomString(length: number = 32): string {
    return require('crypto').randomBytes(length).toString('hex');
  }
}

export const authUtils = new AuthUtils();
