import express from "express";
import { stripeService } from "../services/billing/stripeService.js";
import { userRepository } from "../repositories/userRepository.js";

const router = express.Router();

// Stripe requires raw body for signature verification.
// We expect the router to be mounted such that this middleware handles the parsing.
// Or we apply it here. Since this is specific to /stripe, we apply it here.
// Note: If express.json() is applied globally before this, it will consume the stream.
// So this router must be mounted BEFORE express.json() in server.ts.

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!sig || typeof sig !== "string") {
      return res.status(400).send("Webhook Error: Missing stripe-signature");
    }

    let event;

    try {
      event = await stripeService.verifyWebhookSignature(req.body, sig);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription;

        if (userId && subscriptionId) {
          await userRepository.updateUser(userId, {
            subscriptionStatus: "active",
            subscriptionId: subscriptionId,
            subscriptionProvider: "stripe",
            // currentPeriodEnd would be fetched from subscription object, but session doesn't have it directly usually.
            // We might need to fetch subscription details.
            // But for now, we just set active.
          });
          console.log(`User ${userId} subscription activated.`);
        }
        break;
      }
      // Add other cases like customer.subscription.updated
      default:
        // console.log(`Unhandled event type ${event.type}`);
        break;
    }

    res.json({ received: true });
  },
);

export default router;
