import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { dynamoDBClient, DYNAMODB_DOCUMENTS_TABLE } from "../config/aws.js";
import { usageLimitsRepository } from "./usageLimitsRepository.js";

import type { DocumentRecord } from "./types.js";

/**
 * Find document by content hash and filename (deduplication check)
 */
export async function findByHashAndFilename(
  hash: string,
  filename: string,
): Promise<DocumentRecord | null> {
  const command = new QueryCommand({
    TableName: DYNAMODB_DOCUMENTS_TABLE,
    IndexName: "GSI1",
    KeyConditionExpression: "contentHash = :hash AND filename = :filename",
    ExpressionAttributeValues: {
      ":hash": hash,
      ":filename": filename,
    },
    Limit: 1,
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Items || response.Items.length === 0) {
    return null;
  }

  return response.Items[0] as DocumentRecord;
}

/**
 * Create new document record
 */
export async function create(document: DocumentRecord): Promise<void> {
  const command = new PutCommand({
    TableName: DYNAMODB_DOCUMENTS_TABLE,
    Item: {
      ...document,
      SK: "METADATA",
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Find document by ID
 */
export async function findById(
  documentId: string,
): Promise<DocumentRecord | null> {
  const command = new GetCommand({
    TableName: DYNAMODB_DOCUMENTS_TABLE,
    Key: {
      documentId,
      SK: "METADATA",
    },
  });

  const response = await dynamoDBClient.send(command);

  if (!response.Item) {
    return null;
  }

  return response.Item as DocumentRecord;
}

/**
 * Update access metadata (lastAccessedAt, accessCount)
 */
export async function updateAccessMetadata(documentId: string): Promise<void> {
  const command = new UpdateCommand({
    TableName: DYNAMODB_DOCUMENTS_TABLE,
    Key: {
      documentId,
      SK: "METADATA",
    },
    UpdateExpression:
      "SET lastAccessedAt = :now, accessCount = if_not_exists(accessCount, :zero) + :one",
    ExpressionAttributeValues: {
      ":now": new Date().toISOString(),
      ":zero": 0,
      ":one": 1,
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * Delete document record
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const command = new DeleteCommand({
    TableName: DYNAMODB_DOCUMENTS_TABLE,
    Key: {
      documentId,
      SK: "METADATA",
    },
  });

  await dynamoDBClient.send(command);
}

/**
 * List all documents for a user (with pagination)
 * Note: Uses Scan operation since GSI2 (userId index) is not yet created.
 * For production, add GSI2 with userId as partition key for better performance.
 */
export async function listByUserId(
  userId: string,
  limit: number = 50,
  lastEvaluatedKey?: Record<string, any>,
): Promise<{
  documents: DocumentRecord[];
  lastEvaluatedKey?: Record<string, any>;
}> {
  const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");

  const command = new ScanCommand({
    TableName: DYNAMODB_DOCUMENTS_TABLE,
    FilterExpression: "userId = :userId AND SK = :sk",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":sk": "METADATA",
    },
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  });

  const response = await dynamoDBClient.send(command);

  // Sort by uploadedAt (newest first) since Scan doesn't guarantee order
  const sortedDocuments = (response.Items || []).sort((a: any, b: any) => {
    const dateA = new Date(a.uploadedAt).getTime();
    const dateB = new Date(b.uploadedAt).getTime();
    return dateB - dateA;
  });

  return {
    documents: sortedDocuments as DocumentRecord[],
    lastEvaluatedKey: response.LastEvaluatedKey,
  };
}

/**
 * Count active documents for a user
 */
export async function countByUserId(userId: string): Promise<number> {
  const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");
  const command = new ScanCommand({
    TableName: DYNAMODB_DOCUMENTS_TABLE,
    FilterExpression: "userId = :userId AND SK = :sk",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":sk": "METADATA",
    },
    Select: "COUNT",
  });

  const response = await dynamoDBClient.send(command);
  return response.Count || 0;
}

/**
 * Get dashboard statistics for a user
 */
export async function getStatsByUserId(userId: string): Promise<{
  totalDocuments: number;
  totalWords: number;
  documentsThisWeek: number;
  totalGraphs: number;
  dailyAnalysisUsage: number;
  storageUsed: number;
}> {
  const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");

  const command = new ScanCommand({
    TableName: DYNAMODB_DOCUMENTS_TABLE,
    FilterExpression: "userId = :userId AND SK = :sk",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":sk": "METADATA",
    },
  });

  const response = await dynamoDBClient.send(command);
  const docs = response.Items || [];

  const totalDocuments = docs.length;
  const totalWords = docs.reduce(
    (acc: number, doc: any) => acc + (doc.wordCount || 0),
    0,
  );

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const docsThisWeek = docs.filter(
    (doc: any) => new Date(doc.uploadedAt) > oneWeekAgo,
  ).length;

  // Total graphs generated across all user documents
  // We'll count analysis records as a proxy for now, or just return a placeholder
  // TODO: Implement more accurate graph counting by querying visualizationService
  const totalGraphs = docs.filter((doc: any) => doc.hasAnalysis).length;

  // Get daily usage from UsageLimitsRepository
  const dailyUsage = await usageLimitsRepository.getDailyUsage(userId);

  // Calculate storage used (sum of file sizes)
  const storageUsed = docs.reduce(
    (acc: number, doc: any) => acc + (doc.fileSize || 0),
    0,
  );

  return {
    totalDocuments,
    totalWords: Math.round(totalWords),
    documentsThisWeek: docsThisWeek,
    totalGraphs: totalGraphs || 0,
    dailyAnalysisUsage: dailyUsage?.analysisCount || 0,
    storageUsed,
  };
}
