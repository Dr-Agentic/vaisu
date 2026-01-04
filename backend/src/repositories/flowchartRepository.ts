import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, DYNAMODB_FLOWCHART_TABLE, isPersistenceEnabled } from '../config/aws.js';
import { localStore } from '../services/storage/localStore.js';
import type { VisualizationRecord } from './types.js';

/**
 * Create new flowchart visualization record
 */
export async function create(flowchart: VisualizationRecord): Promise<void> {
  if (!isPersistenceEnabled()) {
    localStore.saveVisualization(flowchart);
    return;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_FLOWCHART_TABLE,
    Item: {
      ...flowchart,
      SK: 'FLOWCHART',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find flowchart by document ID
 */
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null> {
  if (!isPersistenceEnabled()) {
    return localStore.getVisualization(documentId, 'flowchart');
  }

  const command = new GetCommand({
    TableName: DYNAMODB_FLOWCHART_TABLE,
    Key: {
      documentId,
      SK: 'FLOWCHART',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update flowchart record (for regeneration)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>
): Promise<void> {
  if (!isPersistenceEnabled()) {
    const existing = localStore.getVisualization(documentId, 'flowchart');
    if (existing) {
      localStore.saveVisualization({ ...existing, ...updates });
    }
    return;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_FLOWCHART_TABLE,
    Item: {
      documentId,
      SK: 'FLOWCHART',
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete flowchart record
 */
export async function deleteFlowchart(documentId: string): Promise<void> {
  if (!isPersistenceEnabled()) {
    const existing = localStore.getVisualization(documentId, 'flowchart');
    if (existing) {
      localStore.deleteVisualization(documentId, 'flowchart');
    }
    return;
  }

  const command = new DeleteCommand({
    TableName: DYNAMODB_FLOWCHART_TABLE,
    Key: {
      documentId,
      SK: 'FLOWCHART',
    },
  });

  await dynamoDBClient.send(command);
}