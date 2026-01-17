import { describe, it, expect } from 'vitest';
import { authUtils } from '../auth.js';

describe('AuthUtils', () => {
  describe('Password Hashing', () => {
    it('should hash a password correctly', async () => {
      const password = 'TestPassword123!';
      const hash = await authUtils.hashPassword(password);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
    });

    it('should verify a correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await authUtils.hashPassword(password);
      const isValid = await authUtils.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await authUtils.hashPassword(password);
      const isValid = await authUtils.verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate a valid access token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = authUtils.generateAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should verify a valid access token', () => {
      const payload = { userId: '123', email: 'test@example.com' };
      const token = authUtils.generateAccessToken(payload);
      const decoded = authUtils.verifyAccessToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
    });

    it('should return null for invalid token', () => {
      const decoded = authUtils.verifyAccessToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should validate correct email formats', () => {
      expect(authUtils.validateEmail('test@example.com')).toBe(true);
      expect(authUtils.validateEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(authUtils.validateEmail('invalid-email')).toBe(false);
      expect(authUtils.validateEmail('@domain.com')).toBe(false);
      expect(authUtils.validateEmail('user@')).toBe(false);
    });

    it('should validate strong passwords', () => {
      const result = authUtils.validatePassword('StrongPass1!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = authUtils.validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
