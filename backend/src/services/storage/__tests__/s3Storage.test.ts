import { Readable } from 'stream';

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { describe, it, expect, vi, beforeEach } from 'vitest';


import {
  buildS3Key,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from '../s3Storage.js';

const s3Mock = mockClient(S3Client);

describe('s3Storage', () => {
  beforeEach(() => {
    s3Mock.reset();
  });

  describe('buildS3Key', () => {
    it('should build correct S3 key format', () => {
      const hash = 'abc123';
      const filename = 'document.txt';
      const key = buildS3Key(hash, filename);

      expect(key).toBe('documents/abc123/document.txt');
    });

    it('should handle filenames with special characters', () => {
      const hash = 'def456';
      const filename = 'my document (v2).pdf';
      const key = buildS3Key(hash, filename);

      expect(key).toBe('documents/def456/my document (v2).pdf');
    });
  });

  describe('uploadDocument', () => {
    it('should upload document to S3', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const hash = 'abc123';
      const filename = 'test.txt';
      const content = Buffer.from('test content');

      const result = await uploadDocument(hash, filename, content);

      expect(result).toEqual({
        bucket: 'vaisu-documents-dev',
        key: 'documents/abc123/test.txt',
        path: 's3://vaisu-documents-dev/documents/abc123/test.txt',
      });

      expect(s3Mock.calls()).toHaveLength(1);
    });

    it('should set correct content type for PDF', async () => {
      s3Mock.on(PutObjectCommand).resolves({});

      const hash = 'def456';
      const filename = 'document.pdf';
      const content = Buffer.from('pdf content');

      await uploadDocument(hash, filename, content);

      const call = s3Mock.call(0);
      expect(call.args[0].input.ContentType).toBe('application/pdf');
    });

    it('should throw error on S3 failure', async () => {
      s3Mock.on(PutObjectCommand).rejects(new Error('S3 error'));

      const hash = 'abc123';
      const filename = 'test.txt';
      const content = Buffer.from('test content');

      await expect(uploadDocument(hash, filename, content)).rejects.toThrow('S3 error');
    });
  });

  describe('downloadDocument', () => {
    it('should download document from S3', async () => {
      const mockContent = 'test content';
      const stream = Readable.from([Buffer.from(mockContent)]);

      s3Mock.on(GetObjectCommand).resolves({
        Body: stream as any,
      });

      const s3Key = 'documents/abc123/test.txt';
      const result = await downloadDocument(s3Key);

      expect(result.toString()).toBe(mockContent);
    });

    it('should throw error if body is empty', async () => {
      s3Mock.on(GetObjectCommand).resolves({
        Body: undefined,
      });

      const s3Key = 'documents/abc123/test.txt';

      await expect(downloadDocument(s3Key)).rejects.toThrow('Empty response body from S3');
    });

    it('should throw error on S3 failure', async () => {
      s3Mock.on(GetObjectCommand).rejects(new Error('Not found'));

      const s3Key = 'documents/abc123/test.txt';

      await expect(downloadDocument(s3Key)).rejects.toThrow('Not found');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document from S3', async () => {
      s3Mock.on(DeleteObjectCommand).resolves({});

      const s3Key = 'documents/abc123/test.txt';
      await deleteDocument(s3Key);

      expect(s3Mock.calls()).toHaveLength(1);
      const call = s3Mock.call(0);
      expect(call.args[0].input.Key).toBe(s3Key);
    });

    it('should throw error on S3 failure', async () => {
      s3Mock.on(DeleteObjectCommand).rejects(new Error('Delete failed'));

      const s3Key = 'documents/abc123/test.txt';

      await expect(deleteDocument(s3Key)).rejects.toThrow('Delete failed');
    });
  });
});
