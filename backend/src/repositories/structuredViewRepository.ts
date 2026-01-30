// Import types
import type { VisualizationRecord } from './types.js';

// Import AWS SDK commands
import { PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

// Import dynamoDB client and table constant
import { dynamoDBClient, DYNAMODB_STRUCTURED_VIEW_TABLE } from '../config/aws.js';

const TABLE_NAME = DYNAMODB_STRUCTURED_VIEW_TABLE;

/**
 * Create a new structured-view visualization record
 */
export async function create(record: VisualizationRecord): Promise<void> {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      ...record,
      SK: 'STRUCTURED_VIEW',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find a structured-view visualization by document ID
 */
export async function findByDocumentId(
  documentId: string,
): Promise<VisualizationRecord | null> {
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      documentId,
      SK: 'STRUCTURED_VIEW',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update an existing structured-view visualization record
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>,
): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

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
    TableName: TABLE_NAME,
    Key: {
      documentId,
      SK: 'STRUCTURED_VIEW',
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete a structured-view visualization record
 */
export async function deleteVisualization(
  documentId: string,
): Promise<void> {
  const command = new DeleteCommand({
    TableName: TABLE_NAME,
    Key: {
      documentId,
      SK: 'STRUCTURED_VIEW',
    },
  });

  await dynamoDBClient.send(command);
}
