import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { userRepository, dynamodb } from "../userRepository.js";

const dynamoMock = mockClient(dynamodb);

// Mock AWS config
vi.mock("../config/aws.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config/aws.js")>();
  return {
    ...actual,
    DYNAMODB_USERS_TABLE: "test-users-table",
  };
});

describe("UserRepository", () => {
  beforeEach(() => {
    dynamoMock.reset();
  });

  describe("createUser", () => {
    it("should create a user successfully", async () => {
      dynamoMock.on(PutCommand).resolves({});

      const userData = {
        email: "test@example.com",
        passwordHash: "hashed_password",
        firstName: "Test",
        lastName: "User",
      };

      const user = await userRepository.createUser(userData);

      expect(user).toBeDefined();
      expect(user.userId).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe("free");
      expect(user.status).toBe("pending_verification");
      expect(dynamoMock.calls()).toHaveLength(1);
    });
  });

  describe("getUserByEmail", () => {
    it("should return user when found", async () => {
      const mockUser = {
        userId: "123",
        email: "test@example.com",
        passwordHash: "hash",
        role: "free",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dynamoMock.on(QueryCommand).resolves({
        Items: [mockUser],
      });

      const user = await userRepository.getUserByEmail("test@example.com");

      expect(user).toBeDefined();
      expect(user?.email).toBe("test@example.com");
    });

    it("should return null when not found", async () => {
      dynamoMock.on(QueryCommand).resolves({
        Items: [],
      });

      const user = await userRepository.getUserByEmail(
        "nonexistent@example.com",
      );

      expect(user).toBeNull();
    });
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      const mockUser = {
        userId: "123",
        email: "test@example.com",
        passwordHash: "hash",
        role: "free",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dynamoMock.on(GetCommand).resolves({
        Item: mockUser,
      });

      const user = await userRepository.getUserById("123");

      expect(user).toBeDefined();
      expect(user?.userId).toBe("123");
    });

    it("should return null when not found", async () => {
      dynamoMock.on(GetCommand).resolves({});

      const user = await userRepository.getUserById("nonexistent");

      expect(user).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("should update user subscription status successfully", async () => {
      const userId = "123";
      const updates = {
        subscriptionStatus: "active" as const,
        subscriptionId: "sub_123",
        subscriptionProvider: "stripe",
        currentPeriodEnd: new Date().toISOString(),
      };

      dynamoMock.on(UpdateCommand).resolves({
        Attributes: {
          userId,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      });

      const updatedUser = await userRepository.updateUser(userId, updates);

      expect(updatedUser).toBeDefined();
      expect(updatedUser.subscriptionStatus).toBe("active");
      expect(updatedUser.subscriptionId).toBe("sub_123");
      expect(updatedUser.subscriptionProvider).toBe("stripe");
      expect(updatedUser.currentPeriodEnd).toBeDefined();
    });
  });
});
