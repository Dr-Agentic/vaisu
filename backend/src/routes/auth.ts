
import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

import { authenticate } from '../middleware/auth.js';
import { sessionRepository } from '../repositories/sessionRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { getResendClient } from '../services/email/resendClient.js';
import { authUtils } from '../utils/auth.js';

const router = Router();

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// POST /api/auth/register - Register new user
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('firstName').trim().isLength({ min: 1, max: 50 }),
    body('lastName').trim().isLength({ min: 1, max: 50 }),
    body('password').isLength({ min: 8 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, firstName, lastName, password } = req.body;

      // Validate email format
      if (!authUtils.validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate password strength
      const passwordValidation = authUtils.validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        });
      }

      // Check if user already exists
      const existingUser = await userRepository.getUserByEmail(email);
      if (existingUser) {
        return res
          .status(409)
          .json({ error: 'User with this email already exists' });
      }

      // Hash password
      const passwordHash = await authUtils.hashPassword(password);

      // Create user
      const user = await userRepository.createUser({
        email,
        firstName,
        lastName,
        passwordHash,
      });

      // Auto-verify email (can be changed back later)
      await userRepository.updateUser(user.userId, {
        emailVerified: true,
        status: 'active',
        verificationToken: undefined,
      });

      res.status(201).json({
        message: 'User registered successfully.',
        userId: user.userId,
        email: user.email,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// POST /api/auth/login - Login user
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1 }),
    body('rememberMe').optional().isBoolean(),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Get user by email
      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if account is locked
      const isLocked = await userRepository.isAccountLocked(user.userId);
      if (isLocked) {
        return res.status(423).json({
          error:
            'Account is temporarily locked due to too many failed attempts',
          lockedUntil: user.lockedUntil,
        });
      }

      // Verify password
      const isValidPassword = await authUtils.verifyPassword(
        password,
        user.passwordHash,
      );
      if (!isValidPassword) {
        // Increment failed attempts
        await userRepository.incrementFailedAttempts(user.userId);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Reset failed attempts on successful login
      await userRepository.resetFailedAttempts(user.userId);

      // Update last login
      await userRepository.updateUser(user.userId, {
        lastLogin: new Date().toISOString(),
      });

      // Generate tokens
      const payload = {
        userId: user.userId,
        email: user.email,
      };
      const tokens = authUtils.generateTokenPair(payload);

      // Create session
      const session = await sessionRepository.createSession({
        userId: user.userId,
        refreshToken: tokens.refreshToken,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        message: 'Login successful',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        sessionId: session.sessionId,
        user: {
          userId: user.userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const payload = authUtils.verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if user exists
    const user = await userRepository.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const newAccessToken = authUtils.generateAccessToken({
      userId: user.userId,
      email: user.email,
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (sessionId) {
      await sessionRepository.revokeSession(sessionId);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout-all - Logout from all devices
router.post('/logout-all', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    await sessionRepository.revokeAllUserSessions(userId);

    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify-email - Verify email
router.post(
  '/verify-email',
  [body('userId').isUUID(), body('token').isString().notEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId, token } = req.body;

      const success = await userRepository.verifyEmail(userId, token);

      if (!success) {
        return res
          .status(400)
          .json({ error: 'Invalid or expired verification token' });
      }

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// POST /api/auth/request-password-reset - Request password reset
router.post(
  '/request-password-reset',
  [body('email').isEmail().normalizeEmail()],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const user = await userRepository.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        return res.json({
          message: 'If an account exists, a reset link has been sent',
        });
      }

      // Generate reset token
      const resetToken = authUtils.generateResetToken();
      const resetTokenExpiry = authUtils.generateTokenExpiry(1); // 1 hour

      // Save reset token
      await userRepository.updateUser(user.userId, {
        resetToken,
        resetTokenExpiry,
      });

      // Send reset email
      await getResendClient().sendPasswordResetEmail(email, resetToken);

      res.json({
        message: 'If an account exists, a reset link has been sent',
        // resetToken, // In production, don't return this (Removed for security)
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// POST /api/auth/reset-password - Reset password
router.post(
  '/reset-password',
  [
    body('userId').isUUID(),
    body('token').isString().notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { userId, token, newPassword } = req.body;

      // Validate password strength
      const passwordValidation = authUtils.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        });
      }

      // Hash new password
      const passwordHash = await authUtils.hashPassword(newPassword);

      // Reset password
      const success = await userRepository.resetPassword(
        userId,
        token,
        passwordHash,
      );

      if (!success) {
        return res
          .status(400)
          .json({ error: 'Invalid or expired reset token' });
      }

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// GET /api/auth/sessions - Get user sessions
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID required' });
    }

    const sessions = await sessionRepository.getSessionsByUserId(userId);

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/revoke-session - Revoke specific session
router.post('/revoke-session', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    await sessionRepository.revokeSession(sessionId);

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authenticate, async (req: any, res: Response) => {
  try {
    const user = await userRepository.getUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePictureUrl: user.profilePictureUrl,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
    body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  ],
  validateRequest,
  async (req: any, res: Response) => {
    try {
      const { firstName, lastName } = req.body;
      const userId = req.user!.userId;

      const updatedUser = await userRepository.updateUser(userId, {
        firstName,
        lastName,
      });

      res.json({
        message: 'Profile updated successfully',
        user: {
          userId: updatedUser.userId,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// PUT /api/auth/password - Change password
router.put(
  '/password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  validateRequest,
  async (req: any, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      const user = await userRepository.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current password
      const isValid = await authUtils.verifyPassword(
        currentPassword,
        user.passwordHash,
      );
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid current password' });
      }

      // Validate new password strength
      const passwordValidation = authUtils.validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          error: 'New password does not meet requirements',
          details: passwordValidation.errors,
        });
      }

      // Hash new password
      const newHash = await authUtils.hashPassword(newPassword);

      // Update password
      await userRepository.updateUser(userId, { passwordHash: newHash });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// DELETE /api/auth/account - Delete user account
router.delete('/account', authenticate, async (req: any, res: Response) => {
  try {
    const { password } = req.body;
    const userId = req.user!.userId;

    if (!password) {
      return res
        .status(400)
        .json({ error: 'Password required to confirm deletion' });
    }

    // Get user to verify password
    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await authUtils.verifyPassword(
      password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Delete user (soft delete)
    await userRepository.deleteUser(userId);

    // Revoke all sessions
    await sessionRepository.revokeAllUserSessions(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
