import { describe, it, expect, vi, beforeEach } from "vitest";
import Stripe from "stripe";
import { stripeService } from "./stripeService.js";

// Mock Stripe
vi.mock("stripe", () => {
  const stripeInstance = {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  };

  return {
    default: vi.fn(() => stripeInstance),
  };
});

// Mock env
vi.mock("../../config/env.js", () => ({
  env: {
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_PRICE_ID_PRO: "price_123",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
    APP_URL: "http://localhost:3000",
  },
}));

describe("StripeService", () => {
  let stripeInstance: any;

  beforeEach(async () => {
    // Get the mocked instance
    const StripeConstructor = (await import("stripe")).default;
    stripeInstance = new StripeConstructor("key", {} as any);
    vi.clearAllMocks();
  });

  describe("createCheckoutSession", () => {
    it("should create a checkout session and return URL", async () => {
      const mockSession = { url: "https://checkout.stripe.com/session/123" };
      stripeInstance.checkout.sessions.create.mockResolvedValue(mockSession);

      const url = await stripeService.createCheckoutSession(
        "user1",
        "test@example.com",
      );

      expect(url).toBe(mockSession.url);
      expect(stripeInstance.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "subscription",
          customer_email: "test@example.com",
          client_reference_id: "user1",
          line_items: expect.arrayContaining([
            expect.objectContaining({ price: "price_123" }),
          ]),
        }),
      );
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should verify signature and return event", async () => {
      const mockEvent = { id: "evt_123", type: "checkout.session.completed" };
      stripeInstance.webhooks.constructEvent.mockReturnValue(mockEvent);

      const event = await stripeService.verifyWebhookSignature(
        "payload",
        "sig123",
      );

      expect(event).toEqual(mockEvent);
      expect(stripeInstance.webhooks.constructEvent).toHaveBeenCalledWith(
        "payload",
        "sig123",
        "whsec_123",
      );
    });

    it("should throw error on invalid signature", async () => {
      stripeInstance.webhooks.constructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      await expect(
        stripeService.verifyWebhookSignature("payload", "bad_sig"),
      ).rejects.toThrow("Webhook signature verification failed");
    });
  });
});
