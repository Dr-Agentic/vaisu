import { PutCommand, GetCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDBClient, DYNAMODB_TERMS_DEFINITIONS_TABLE } from '../config/aws.js';

import type { VisualizationRecord } from './types.js';

/**
 * Create new terms and definitions visualization record
 */
export async function create(termsDefinitions: VisualizationRecord): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_TERMS_DEFINITIONS_TABLE,
    Item: {
      ...termsDefinitions,
      SK: 'TERMS_DEFINITIONS',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find terms and definitions by document ID
 */
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null> {
  const command = new GetCommand({
    TableName: DYNAMODB_TERMS_DEFINITIONS_TABLE,
    Key: {
      documentId,
      SK: 'TERMS_DEFINITIONS',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update terms and definitions record (partial update)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>,
): Promise<void> {
  // Build update expression dynamically
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, any> = {};

  // Add updatedAt if not present
  if (!updates.updatedAt) {
    updates.updatedAt = new Date().toISOString();
  }

  Object.entries(updates).forEach(([key, value], index) => {
    // Skip keys that are part of the Primary Key
    if (key !== 'documentId' && key !== 'SK' && key !== 'visualizationType') {
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
    TableName: DYNAMODB_TERMS_DEFINITIONS_TABLE,
    Key: {
      documentId,
      SK: 'TERMS_DEFINITIONS',
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete terms and definitions record
 */
export async function deleteTermsDefinitions(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_TERMS_DEFINITIONS_TABLE,
    Key: {
      documentId,
      SK: 'TERMS_DEFINITIONS',
    },
  });

  await dynamoDBClient.send(command);
}
