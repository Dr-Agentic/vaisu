import type { DocumentAnalysis } from '../../../shared/src/types.js';

/**
 * Document metadata stored in DynamoDB
 */
export interface DocumentRecord {
  documentId: string;
  userId: string;
  contentHash: string;
  filename: string;
  s3Path: string;
  s3Bucket: string;
  s3Key: string;
  contentType: string;
  fileSize: number;
  uploadedAt: string;
  lastAccessedAt: string;
  accessCount: number;
  ttl?: number;
}

/**
 * Analysis results stored in DynamoDB
 */
export interface AnalysisRecord {
  documentId: string;
  analysisVersion: string;
  analysis: DocumentAnalysis;
  llmMetadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    timestamp: string;
  };
  createdAt: string;
}

/**
 * S3 upload result
 */
export interface S3UploadResult {
  bucket: string;
  key: string;
  path: string;
}
