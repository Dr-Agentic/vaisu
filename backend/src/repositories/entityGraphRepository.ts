import { PutCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

import { dynamoDBClient, DYNAMODB_ENTITY_GRAPH_TABLE } from "../config/aws.js";

import type { VisualizationRecord } from "./types.js";

/**
 * Create new entity graph visualization record
 */
export async function create(entityGraph: VisualizationRecord): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_ENTITY_GRAPH_TABLE,
    Item: {
      ...entityGraph,
      SK: "ENTITY_GRAPH",
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find entity graph by document ID
 */
export async function findByDocumentId(
  documentId: string,
): Promise<VisualizationRecord | null> {
  const command = new GetCommand({
    TableName: DYNAMODB_ENTITY_GRAPH_TABLE,
    Key: {
      documentId,
      SK: "ENTITY_GRAPH",
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update entity graph record (for regeneration)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>,
): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_ENTITY_GRAPH_TABLE,
    Item: {
      documentId,
      SK: "ENTITY_GRAPH",
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete entity graph record
 */
export async function deleteEntityGraph(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_ENTITY_GRAPH_TABLE,
    Key: {
      documentId,
      SK: "ENTITY_GRAPH",
    },
  });

  await dynamoDBClient.send(command);
}
