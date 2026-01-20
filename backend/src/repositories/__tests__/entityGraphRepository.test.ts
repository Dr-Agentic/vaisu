import { describe, it, expect, beforeEach, vi } from "vitest";
import { EntityGraphData } from "../../../../shared/src/types";
import * as entityGraphRepository from "../entityGraphRepository";
import { dynamoDBClient } from "../../config/aws";

// Mock AWS SDK
vi.mock("../../config/aws", () => ({
  dynamoDBClient: {
    send: vi.fn(),
  },
  DYNAMODB_ENTITY_GRAPH_TABLE: "test-table",
}));

describe("entityGraphRepository", () => {
  const mockEntityGraphData: EntityGraphData = {
    nodes: [
      {
        id: "node-1",
        label: "Test Node",
        summary: "Summary",
        depth: 5,
        sequenceIndex: 0,
        type: "concept",
        clarityScore: 0.8,
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "node-1",
        target: "node-2",
        type: "leads-to",
        strength: 0.9,
      },
    ],
    metadata: {
      trajectory: "Linear",
      depthScore: 7.5,
      totalUnits: 1,
    },
  };

  const mockRecord = {
    documentId: "doc-123",
    visualizationType: "entity-graph",
    visualizationData: mockEntityGraphData,
    llmMetadata: {
      model: "test-model",
      tokensUsed: 100,
      processingTime: 1000,
      timestamp: "2024-01-01T00:00:00Z",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should store entity graph in DynamoDB", async () => {
      await entityGraphRepository.create(mockRecord);

      expect(dynamoDBClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: "test-table",
            Item: expect.objectContaining({
              documentId: "doc-123",
              SK: "ENTITY_GRAPH",
              visualizationType: "entity-graph",
            }),
          }),
        }),
      );
    });
  });

  describe("findByDocumentId", () => {
    it("should retrieve entity graph by document ID", async () => {
      vi.mocked(dynamoDBClient.send).mockResolvedValue({
        Item: { ...mockRecord, SK: "ENTITY_GRAPH" },
      });

      const result = await entityGraphRepository.findByDocumentId("doc-123");

      expect(result).toEqual(
        expect.objectContaining({
          documentId: "doc-123",
          visualizationType: "entity-graph",
        }),
      );
      expect(dynamoDBClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: "test-table",
            Key: {
              documentId: "doc-123",
              SK: "ENTITY_GRAPH",
            },
          }),
        }),
      );
    });

    it("should return null if not found", async () => {
      vi.mocked(dynamoDBClient.send).mockResolvedValue({ Item: undefined });

      const result = await entityGraphRepository.findByDocumentId("doc-123");

      expect(result).toBeNull();
    });
  });

  describe("deleteEntityGraph", () => {
    it("should delete entity graph from DynamoDB", async () => {
      await entityGraphRepository.deleteEntityGraph("doc-123");

      expect(dynamoDBClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            TableName: "test-table",
            Key: {
              documentId: "doc-123",
              SK: "ENTITY_GRAPH",
            },
          }),
        }),
      );
    });
  });
});
