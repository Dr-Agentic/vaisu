import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, DYNAMODB_EXECUTIVE_DASHBOARD_TABLE, isPersistenceEnabled } from '../config/aws.js';
import { localStore } from '../services/storage/localStore.js';
import type { VisualizationRecord } from './types.js';

/**
 * Create new executive dashboard visualization record
 */
export async function create(executiveDashboard: VisualizationRecord): Promise<void> {
  if (!isPersistenceEnabled()) {
    localStore.saveVisualization(executiveDashboard);
    return;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_EXECUTIVE_DASHBOARD_TABLE,
    Item: {
      ...executiveDashboard,
      SK: 'EXECUTIVE_DASHBOARD',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find executive dashboard by document ID
 */
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null> {
  if (!isPersistenceEnabled()) {
    return localStore.getVisualization(documentId, 'executive-dashboard');
  }

  const command = new GetCommand({
    TableName: DYNAMODB_EXECUTIVE_DASHBOARD_TABLE,
    Key: {
      documentId,
      SK: 'EXECUTIVE_DASHBOARD',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update executive dashboard record (for regeneration)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>
): Promise<void> {
  if (!isPersistenceEnabled()) {
    const existing = localStore.getVisualization(documentId, 'executive-dashboard');
    if (existing) {
      localStore.saveVisualization({ ...existing, ...updates });
    }
    return;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_EXECUTIVE_DASHBOARD_TABLE,
    Item: {
      documentId,
      SK: 'EXECUTIVE_DASHBOARD',
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete executive dashboard record
 */
export async function deleteExecutiveDashboard(documentId: string): Promise<void> {
  if (!isPersistenceEnabled()) {
    const existing = localStore.getVisualization(documentId, 'executive-dashboard');
    if (existing) {
      localStore.deleteVisualization(documentId, 'executive-dashboard');
    }
    return;
  }

  const command = new DeleteCommand({
    TableName: DYNAMODB_EXECUTIVE_DASHBOARD_TABLE,
    Key: {
      documentId,
      SK: 'EXECUTIVE_DASHBOARD',
    },
  });

  await dynamoDBClient.send(command);
}