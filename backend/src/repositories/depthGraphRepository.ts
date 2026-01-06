import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDBClient, DYNAMODB_DEPTH_GRAPH_TABLE } from '../config/aws.js';

import type { VisualizationRecord } from './types.js';

/**
 * Create new depth graph visualization record
 */
export async function create(depthGraph: VisualizationRecord): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_DEPTH_GRAPH_TABLE,
    Item: {
      ...depthGraph,
      SK: 'DEPTH_GRAPH',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find depth graph by document ID
 */
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null> {
  const command = new GetCommand({
    TableName: DYNAMODB_DEPTH_GRAPH_TABLE,
    Key: {
      documentId,
      SK: 'DEPTH_GRAPH',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update depth graph record (for regeneration)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>,
): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_DEPTH_GRAPH_TABLE,
    Item: {
      documentId,
      SK: 'DEPTH_GRAPH',
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete depth graph record
 */
export async function deleteDepthGraph(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_DEPTH_GRAPH_TABLE,
    Key: {
      documentId,
      SK: 'DEPTH_GRAPH',
    },
  });

  await dynamoDBClient.send(command);
}
