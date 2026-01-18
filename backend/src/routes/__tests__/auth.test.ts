import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRouter from '../auth.js';
import { userRepository } from '../../repositories/userRepository.js';
import { sessionRepository } from '../../repositories/sessionRepository.js';
import { authUtils } from '../../utils/auth.js';

// Mock dependencies
vi.mock('../../repositories/userRepository.js');
vi.mock('../../repositories/sessionRepository.js');
vi.mock('../../utils/auth.js');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      // Mock validations
      vi.spyOn(authUtils, 'validateEmail').mockReturnValue(true);
      vi.spyOn(authUtils, 'validatePassword').mockReturnValue({ valid: true, errors: [] });
      vi.spyOn(authUtils, 'hashPassword').mockResolvedValue('hashed_password');
      
      // Mock repository calls
      vi.mocked(userRepository.getUserByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.createUser).mockResolvedValue({
        userId: '123',
        email: userData.email,
        passwordHash: 'hashed_password',
        role: 'free',
        status: 'pending_verification',
        emailVerified: false,
        verificationToken: 'token',
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId', '123');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 for invalid email', async () => {
      vi.spyOn(authUtils, 'validateEmail').mockReturnValue(false);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid',
          password: 'Password123!',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockUser = {
        userId: '123',
        email: loginData.email,
        passwordHash: 'hashed_password',
        role: 'free' as const,
        status: 'active' as const,
        emailVerified: true,
        failedLoginAttempts: 0,
        createdAt: '',
        updatedAt: '',
      };

      vi.mocked(userRepository.getUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(userRepository.isAccountLocked).mockResolvedValue(false);
      vi.spyOn(authUtils, 'verifyPassword').mockResolvedValue(true);
      vi.spyOn(authUtils, 'generateTokenPair').mockReturnValue({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
      vi.mocked(sessionRepository.createSession).mockResolvedValue({
        sessionId: 'session_123',
        userId: '123',
        refreshToken: 'refresh_token',
        createdAt: '',
        expiresAt: '',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken', 'access_token');
      expect(response.body).toHaveProperty('user');
    });

    it('should return 401 for invalid credentials', async () => {
      vi.mocked(userRepository.getUserByEmail).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/auth/account', () => {
    it('should delete account successfully with valid password', async () => {
      const userId = '123';
      const password = 'Password123!';

      // Mock authentication middleware behavior
      // Since we can't easily mock the middleware function itself in this setup without changing how app is created,
      // we rely on mocking the dependencies that the middleware uses.

      // 1. Mock token verification
      vi.spyOn(authUtils, 'verifyAccessToken').mockReturnValue({ userId, email: 'test@example.com' });

      // 2. Mock user retrieval for middleware AND for the route handler
      const mockUser = {
        userId,
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        status: 'active' as const,
      };
      vi.mocked(userRepository.getUserById).mockResolvedValue(mockUser as any);

      // 3. Mock password verification
      vi.spyOn(authUtils, 'verifyPassword').mockResolvedValue(true);

      // 4. Mock delete and revoke
      vi.mocked(userRepository.deleteUser).mockResolvedValue(undefined);
      vi.mocked(sessionRepository.revokeAllUserSessions).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', 'Bearer valid_token')
        .send({ password });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Account deleted successfully');
      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
      expect(sessionRepository.revokeAllUserSessions).toHaveBeenCalledWith(userId);
    });

    it('should return 401 if password is invalid', async () => {
      const userId = '123';

      vi.spyOn(authUtils, 'verifyAccessToken').mockReturnValue({ userId, email: 'test@example.com' });
      vi.mocked(userRepository.getUserById).mockResolvedValue({
        userId,
        status: 'active',
        passwordHash: 'hashed_password',
      } as any);
      vi.spyOn(authUtils, 'verifyPassword').mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/auth/account')
        .set('Authorization', 'Bearer valid_token')
        .send({ password: 'WrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid password');
    });
  });
});
