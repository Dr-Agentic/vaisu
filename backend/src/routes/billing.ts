import { Router, Request, Response } from 'express';

import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { stripeService } from '../services/billing/stripeService.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// POST /api/billing/checkout-session
router.post('/checkout-session', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { userId, email } = authReq.user!;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'User email is required for checkout' });
    }

    const url = await stripeService.createCheckoutSession(userId, email);
    res.json({ url });
  } catch (error: any) {
    console.error('Create checkout session error:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to create checkout session' });
  }
});

export default router;
