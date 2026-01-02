import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME, isPersistenceEnabled } from '../../config/aws.js';
import { localStore } from './localStore.js';
import type { S3UploadResult } from '../../repositories/types.js';

/**
 * Build S3 key from hash and filename
 * Format: documents/{hash}/{filename}
 */
export function buildS3Key(hash: string, filename: string): string {
  return `documents/${hash}/${filename}`;
}

/**
 * Upload document to S3
 */
export async function uploadDocument(
  hash: string,
  filename: string,
  content: Buffer
): Promise<S3UploadResult> {
  const key = buildS3Key(hash, filename);

  if (!isPersistenceEnabled()) {
    const filePath = await localStore.saveFile(key, content);
    return {
      bucket: 'local',
      key,
      path: `file://${filePath}`,
    };
  }

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: content,
    ContentType: getContentType(filename),
  });

  await s3Client.send(command);

  return {
    bucket: S3_BUCKET_NAME,
    key,
    path: `s3://${S3_BUCKET_NAME}/${key}`,
  };
}

/**
 * Download document from S3
 */
export async function downloadDocument(s3Key: string): Promise<Buffer> {
  if (!isPersistenceEnabled()) {
    return localStore.getFile(s3Key);
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error('Empty response body from S3');
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Delete document from S3
 */
export async function deleteDocument(s3Key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
  });

  await s3Client.send(command);
}

/**
 * Generate presigned URL for temporary document access
 * @param s3Key - S3 object key
 * @param expiresIn - URL expiration in seconds (default: 900 = 15 minutes)
 */
export async function generatePresignedUrl(s3Key: string, expiresIn: number = 900): Promise<string> {
  if (!isPersistenceEnabled()) {
    return `http://localhost:3001/api/documents/files/${s3Key}`; // Dummy local URL
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: s3Key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Determine content type from filename
 */
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();

  const contentTypes: Record<string, string> = {
    txt: 'text/plain',
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    md: 'text/markdown',
  };

  return contentTypes[ext || ''] || 'application/octet-stream';
}
