import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, DYNAMODB_ARGUMENT_MAP_TABLE, isPersistenceEnabled } from '../config/aws.js';
import { localStore } from '../services/storage/localStore.js';
import type { VisualizationRecord } from './types.js';

/**
 * Create new argument map visualization record
 */
export async function create(argumentMap: VisualizationRecord): Promise<void> {
  if (!isPersistenceEnabled()) {
    localStore.saveVisualization(argumentMap);
    return;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_ARGUMENT_MAP_TABLE,
    Item: {
      ...argumentMap,
      SK: 'ARGUMENT_MAP',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find argument map by document ID
 */
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null> {
  if (!isPersistenceEnabled()) {
    return localStore.getVisualization(documentId, 'argument-map');
  }

  const command = new GetCommand({
    TableName: DYNAMODB_ARGUMENT_MAP_TABLE,
    Key: {
      documentId,
      SK: 'ARGUMENT_MAP',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update argument map record (for regeneration)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>
): Promise<void> {
  if (!isPersistenceEnabled()) {
    const existing = localStore.getVisualization(documentId, 'argument-map');
    if (existing) {
      localStore.saveVisualization({ ...existing, ...updates });
    }
    return;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_ARGUMENT_MAP_TABLE,
    Item: {
      documentId,
      SK: 'ARGUMENT_MAP',
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete argument map record
 */
export async function deleteArgumentMap(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_ARGUMENT_MAP_TABLE,
    Key: {
      documentId,
      SK: 'ARGUMENT_MAP',
    },
  });

  await dynamoDBClient.send(command);
}