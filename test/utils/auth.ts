import { authUtils } from '../../backend/src/utils/auth.js';

/**
 * Generate a test access token for the specified user
 */
export function generateTestToken(userId: string = 'test-user-id', email: string = 'test@example.com'): string {
  return authUtils.generateAccessToken({
    userId,
    email,
  });
}

/**
 * Generate test token with custom payload
 */
export function generateTestTokenWithPayload(payload: { userId: string; email: string }): string {
  return authUtils.generateAccessToken(payload);
}

/**
 * Auth header helper for supertest requests
 */
export function getAuthHeader(userId?: string): Record<string, string> {
  const token = generateTestToken(userId);
  return { Authorization: `Bearer ${token}` };
}
