import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, DYNAMODB_TIMELINE_TABLE, isPersistenceEnabled } from '../config/aws.js';
import { localStore } from '../services/storage/localStore.js';
import type { VisualizationRecord } from './types.js';

/**
 * Create new timeline visualization record
 */
export async function create(timeline: VisualizationRecord): Promise<void> {
  if (!isPersistenceEnabled()) {
    localStore.saveVisualization(timeline);
    return;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_TIMELINE_TABLE,
    Item: {
      ...timeline,
      SK: 'TIMELINE',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find timeline by document ID
 */
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null> {
  if (!isPersistenceEnabled()) {
    return localStore.getVisualization(documentId, 'timeline');
  }

  const command = new GetCommand({
    TableName: DYNAMODB_TIMELINE_TABLE,
    Key: {
      documentId,
      SK: 'TIMELINE',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update timeline record (for regeneration)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>
): Promise<void> {
  if (!isPersistenceEnabled()) {
    const existing = localStore.getVisualization(documentId, 'timeline');
    if (existing) {
      localStore.saveVisualization({ ...existing, ...updates });
    }
    return;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_TIMELINE_TABLE,
    Item: {
      documentId,
      SK: 'TIMELINE',
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete timeline record
 */
export async function deleteTimeline(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_TIMELINE_TABLE,
    Key: {
      documentId,
      SK: 'TIMELINE',
    },
  });

  await dynamoDBClient.send(command);
}