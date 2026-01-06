import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDBClient, DYNAMODB_UML_CLASS_TABLE } from '../config/aws.js';

import type { VisualizationRecord } from './types.js';

/**
 * Create new UML class diagram visualization record
 */
export async function create(umlClass: VisualizationRecord): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_UML_CLASS_TABLE,
    Item: {
      ...umlClass,
      SK: 'UML_CLASS',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find UML class diagram by document ID
 */
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null> {
  const command = new GetCommand({
    TableName: DYNAMODB_UML_CLASS_TABLE,
    Key: {
      documentId,
      SK: 'UML_CLASS',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update UML class diagram record (for regeneration)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>,
): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_UML_CLASS_TABLE,
    Item: {
      documentId,
      SK: 'UML_CLASS',
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete UML class diagram record
 */
export async function deleteUmlClass(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_UML_CLASS_TABLE,
    Key: {
      documentId,
      SK: 'UML_CLASS',
    },
  });

  await dynamoDBClient.send(command);
}
