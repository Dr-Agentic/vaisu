import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../../server.js";
import { stripeService } from "../../services/billing/stripeService.js";
import { userRepository } from "../../repositories/userRepository.js";

// Mock AWS Config first to avoid validation error during app import
vi.mock("../../config/aws.js", async (importOriginal) => {
  return {
    ...(await importOriginal<any>()),
    validateAWSConfig: vi.fn(), // Skip validation
    DYNAMODB_USERS_TABLE: "test-users",
    DYNAMODB_DOCUMENTS_TABLE: "test-docs",
  };
});

// Mock stripeService
vi.mock("../../services/billing/stripeService.js", () => ({
  stripeService: {
    verifyWebhookSignature: vi.fn(),
  },
}));

// Mock userRepository
vi.mock("../../repositories/userRepository.js", () => ({
  userRepository: {
    updateUser: vi.fn(),
  },
}));

describe("Webhook Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /webhooks/stripe", () => {
    it("should update user on checkout.session.completed", async () => {
      const mockEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            client_reference_id: "user123",
            subscription: "sub_123",
          },
        },
      };

      (stripeService.verifyWebhookSignature as any).mockResolvedValue(
        mockEvent,
      );
      (userRepository.updateUser as any).mockResolvedValue({});

      await request(app)
        .post("/webhooks/stripe")
        .set("stripe-signature", "valid_sig")
        .send({ some: "data" })
        .expect(200);

      expect(stripeService.verifyWebhookSignature).toHaveBeenCalled();
      expect(userRepository.updateUser).toHaveBeenCalledWith(
        "user123",
        expect.objectContaining({
          subscriptionStatus: "active",
          subscriptionId: "sub_123",
          subscriptionProvider: "stripe",
        }),
      );
    });

    it("should return 400 on signature verification failure", async () => {
      (stripeService.verifyWebhookSignature as any).mockRejectedValue(
        new Error("Invalid signature"),
      );

      await request(app)
        .post("/webhooks/stripe")
        .set("stripe-signature", "bad_sig")
        .send({})
        .expect(400);
    });
  });
});
