import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { usageLimitsRepository } from "../usageLimitsRepository.js";

// Mock AWS config
vi.mock("../config/aws.js", async (importOriginal) => {
  return {
    ...(await importOriginal<any>()),
    DYNAMODB_USAGE_TABLE: "test-usage-table",
  };
});

const dynamoMock = mockClient(DynamoDBClient);

describe("usageLimitsRepository", () => {
  beforeEach(() => {
    dynamoMock.reset();
  });

  describe("incrementAnalysisCount", () => {
    it("should create new daily record if not exists", async () => {
      // Mock getUsageLimits returning null
      dynamoMock.on(GetCommand).resolves({ Item: undefined });
      dynamoMock.on(PutCommand).resolves({});

      const now = new Date();
      const expectedPeriod = now.toISOString().split("T")[0];

      await usageLimitsRepository.incrementAnalysisCount("user1");

      expect(dynamoMock.calls()).toHaveLength(2); // Get then Put

      const putCall = dynamoMock.calls()[1];
      const putInput = putCall.args[0].input as any;
      expect(putInput.Item.period).toBe(expectedPeriod);
      expect(putInput.Item.analysisCount).toBe(1);
    });

    it("should increment existing daily record", async () => {
      const now = new Date();
      const expectedPeriod = now.toISOString().split("T")[0];

      // Mock getUsageLimits returning existing record
      dynamoMock.on(GetCommand).resolves({
        Item: {
          userId: "user1",
          period: expectedPeriod,
          analysisCount: 5,
        },
      });

      dynamoMock.on(UpdateCommand).resolves({
        Attributes: {
          userId: "user1",
          period: expectedPeriod,
          analysisCount: 6,
        },
      });

      const result =
        await usageLimitsRepository.incrementAnalysisCount("user1");

      expect(dynamoMock.calls()).toHaveLength(2); // Get then Update

      const updateCall = dynamoMock.calls()[1];
      const updateInput = updateCall.args[0].input as any;
      expect(updateInput.Key.period).toBe(expectedPeriod);
      expect(result.analysisCount).toBe(6);
    });
  });
});
