import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDBClient, DYNAMODB_MIND_MAP_TABLE } from '../config/aws.js';

import type { VisualizationRecord } from './types.js';

/**
 * Create new mind map visualization record
 */
export async function create(mindMap: VisualizationRecord): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_MIND_MAP_TABLE,
    Item: {
      ...mindMap,
      SK: 'MIND_MAP',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find mind map by document ID
 */
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null> {
  const command = new GetCommand({
    TableName: DYNAMODB_MIND_MAP_TABLE,
    Key: {
      documentId,
      SK: 'MIND_MAP',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update mind map record (for regeneration)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>,
): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_MIND_MAP_TABLE,
    Item: {
      documentId,
      SK: 'MIND_MAP',
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete mind map record
 */
export async function deleteMindMap(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_MIND_MAP_TABLE,
    Key: {
      documentId,
      SK: 'MIND_MAP',
    },
  });

  await dynamoDBClient.send(command);
}
