import type { DocumentAnalysis } from '../../shared/src/types.js';

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
  wordCount: number;
  hasAnalysis?: boolean;
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
 * Visualization data stored in DynamoDB
 */
export interface VisualizationRecord {
  documentId: string;
  visualizationType: string;
  visualizationData: any;
  llmMetadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * S3 upload result
 */
export interface S3UploadResult {
  bucket: string;
  key: string;
  path: string;
}

/**
 * Knowledge Graph Node
 */
export interface KnowledgeGraphNode {
  id: string;
  documentId: string;
  label: string;
  entityType: string;
  confidence: number;
  metadata: {
    sources: string[];
    description?: string;
    category?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Knowledge Graph Edge
 */
export interface KnowledgeGraphEdge {
  id: string;
  documentId: string;
  sourceId: string;
  targetId: string;
  relation: string;
  weight: number;
  evidence: string[];
  relationshipType: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Unified Knowledge Graph Record (Node or Edge)
 */
export type KnowledgeGraphRecord = KnowledgeGraphNode | KnowledgeGraphEdge;
