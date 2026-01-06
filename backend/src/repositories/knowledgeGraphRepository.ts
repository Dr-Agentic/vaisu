import { PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDBClient, DYNAMODB_KNOWLEDGE_GRAPH_TABLE } from '../config/aws.js';

import type { VisualizationRecord } from './types.js';

/**
 * Knowledge Graph Repository
 * Manages KnowledgeNode and KnowledgeEdge entities in DynamoDB
 */

/**
 * Create new knowledge graph visualization record containing nodes and edges
 */
export async function create(visualization: VisualizationRecord): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Item: {
      ...visualization,
      SK: 'KNOWLEDGE_GRAPH',
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find knowledge graph by document ID
 */
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null> {
  const command = new GetCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Key: {
      documentId,
      SK: 'KNOWLEDGE_GRAPH',
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as VisualizationRecord;
}

/**
 * Update knowledge graph record (for regeneration)
 */
export async function update(
  documentId: string,
  updates: Partial<VisualizationRecord>,
): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Item: {
      documentId,
      SK: 'KNOWLEDGE_GRAPH',
      ...updates,
      updatedAt: new Date().toISOString(),
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete knowledge graph record
 */
export async function deleteKnowledgeGraph(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Key: {
      documentId,
      SK: 'KNOWLEDGE_GRAPH',
    },
  });

  await dynamoDBClient.send(command);
}
