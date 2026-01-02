import { PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, DYNAMODB_ANALYSES_TABLE, isPersistenceEnabled } from '../config/aws.js';
import { localStore } from '../services/storage/localStore.js';
import type { AnalysisRecord } from './types.js';

/**
 * Create new analysis record
 */
export async function create(analysis: AnalysisRecord): Promise<void> {
  if (!isPersistenceEnabled()) {
    localStore.saveAnalysis(analysis);
    return;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_ANALYSES_TABLE,
    Item: {
      ...analysis,
      SK: 'ANALYSIS',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find analysis by document ID
 */
export async function findByDocumentId(documentId: string): Promise<AnalysisRecord | null> {
  if (!isPersistenceEnabled()) {
    return localStore.getAnalysis(documentId);
  }

  const command = new GetCommand({
    TableName: DYNAMODB_ANALYSES_TABLE,
    Key: {
      documentId,
      SK: 'ANALYSIS',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as AnalysisRecord;
}

/**
 * Update analysis record (partial update)
 */
export async function update(documentId: string, updates: Partial<AnalysisRecord>): Promise<void> {
  if (!isPersistenceEnabled()) {
    const existing = localStore.getAnalysis(documentId);
    if (existing) {
      localStore.saveAnalysis({ ...existing, ...updates });
    }
    return;
  }

  // Build update expression dynamically
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  Object.entries(updates).forEach(([key, value], index) => {
    if (key !== 'documentId' && key !== 'SK') {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      updateExpressions.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = value;
    }
  });

  if (updateExpressions.length === 0) {
    return;
  }

  const command = new UpdateCommand({
    TableName: DYNAMODB_ANALYSES_TABLE,
    Key: {
      documentId,
      SK: 'ANALYSIS',
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete analysis record
 */
export async function deleteAnalysis(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_ANALYSES_TABLE,
    Key: {
      documentId,
      SK: 'ANALYSIS',
    },
  });

  await dynamoDBClient.send(command);
}
