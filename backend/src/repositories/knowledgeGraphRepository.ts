import { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient, DYNAMODB_KNOWLEDGE_GRAPH_TABLE } from '../config/aws.js';
import type { KnowledgeGraphRecord } from './types.js';

/**
 * Knowledge Graph Repository
 * Manages KnowledgeNode and KnowledgeEdge entities in DynamoDB
 */

/**
 * Create new knowledge graph node
 */
export async function createNode(node: KnowledgeGraphRecord): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Item: {
      documentId: node.documentId,
      type: 'NODE',
      id: node.id,
      label: node.label,
      entityType: node.entityType,
      confidence: node.confidence,
      metadata: node.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Create new knowledge graph edge
 */
export async function createEdge(edge: KnowledgeGraphRecord): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Item: {
      documentId: edge.documentId,
      type: 'EDGE',
      id: edge.id,
      sourceId: edge.sourceId,
      targetId: edge.targetId,
      relation: edge.relation,
      weight: edge.weight,
      evidence: edge.evidence,
      relationshipType: edge.relationshipType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find all nodes and edges for a document
 */
export async function findByDocumentId(documentId: string): Promise<{
  nodes: KnowledgeGraphRecord[],
  edges: KnowledgeGraphRecord[]
}> {
  const command = new QueryCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    KeyConditionExpression: 'documentId = :documentId',
    ExpressionAttributeValues: {
      ':documentId': documentId,
    },
  });

  const result = await dynamoDBClient.send(command);
  const items = result.Items || [];

  const nodes = items
    .filter(item => item.type === 'NODE')
    .map(item => ({
      id: item.id,
      documentId: item.documentId,
      label: item.label,
      entityType: item.entityType,
      confidence: item.confidence,
      metadata: item.metadata,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

  const edges = items
    .filter(item => item.type === 'EDGE')
    .map(item => ({
      id: item.id,
      documentId: item.documentId,
      sourceId: item.sourceId,
      targetId: item.targetId,
      relation: item.relation,
      weight: item.weight,
      evidence: item.evidence,
      relationshipType: item.relationshipType,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

  return { nodes, edges };
}

/**
 * Update knowledge graph node
 */
export async function updateNode(documentId: string, nodeId: string, updates: Partial<KnowledgeGraphRecord>): Promise<void> {
  const command = new UpdateCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Key: {
      documentId: documentId,
      type: 'NODE'
    },
    UpdateExpression: 'SET #updatedAt = :updatedAt, #label = :label, #entityType = :entityType, #confidence = :confidence, #metadata = :metadata',
    ExpressionAttributeNames: {
      '#updatedAt': 'updatedAt',
      '#label': 'label',
      '#entityType': 'entityType',
      '#confidence': 'confidence',
      '#metadata': 'metadata'
    },
    ExpressionAttributeValues: {
      ':updatedAt': new Date().toISOString(),
      ':label': updates.label,
      ':entityType': updates.entityType,
      ':confidence': updates.confidence,
      ':metadata': updates.metadata
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Update knowledge graph edge
 */
export async function updateEdge(documentId: string, sourceId: string, targetId: string, updates: Partial<KnowledgeGraphRecord>): Promise<void> {
  const command = new UpdateCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Key: {
      documentId: documentId,
      type: 'EDGE'
    },
    UpdateExpression: 'SET #updatedAt = :updatedAt, #relation = :relation, #weight = :weight, #evidence = :evidence, #relationshipType = :relationshipType',
    ExpressionAttributeNames: {
      '#updatedAt': 'updatedAt',
      '#relation': 'relation',
      '#weight': 'weight',
      '#evidence': 'evidence',
      '#relationshipType': 'relationshipType'
    },
    ExpressionAttributeValues: {
      ':updatedAt': new Date().toISOString(),
      ':relation': updates.relation,
      ':weight': updates.weight,
      ':evidence': updates.evidence,
      ':relationshipType': updates.relationshipType
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete all knowledge graph data for a document
 */
export async function deleteKnowledgeGraph(documentId: string): Promise<void> {
  const { nodes, edges } = await findByDocumentId(documentId);

  // Delete all nodes
  for (const node of nodes) {
    const command = new DeleteCommand({
      TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
      Key: {
        documentId: documentId,
        type: 'NODE'
      },
    });
    await dynamoDBClient.send(command);
  }

  // Delete all edges
  for (const edge of edges) {
    const command = new DeleteCommand({
      TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
      Key: {
        documentId: documentId,
        type: 'EDGE'
      },
    });
    await dynamoDBClient.send(command);
  }
}

/**
 * Delete specific node
 */
export async function deleteNode(documentId: string, nodeId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Key: {
      documentId: documentId,
      type: 'NODE'
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete specific edge
 */
export async function deleteEdge(documentId: string, sourceId: string, targetId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    Key: {
      documentId: documentId,
      type: 'EDGE'
    },
  });

  await dynamoDBClient.send(command);
}