import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import * as documentRepository from '../documentRepository.js';
import type { DocumentRecord } from '../types.js';

// Mock AWS config
vi.mock('../config/aws.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config/aws.js')>();
  return {
    ...actual,
    DYNAMODB_DOCUMENTS_TABLE: 'test-documents-table',
  };
});

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe('documentRepository', () => {
  beforeEach(() => {
    dynamoMock.reset();
  });

  describe('findByHashAndFilename', () => {
    it('should find document by hash and filename', async () => {
      const mockDoc: DocumentRecord = {
        documentId: 'test-id',
        userId: '1',
        contentHash: 'abc123',
        filename: 'test.txt',
        s3Path: 's3://bucket/test.txt',
        s3Bucket: 'bucket',
        s3Key: 'documents/abc123/test.txt',
        contentType: 'text/plain',
        fileSize: 100,
        uploadedAt: '2025-12-07T00:00:00Z',
        lastAccessedAt: '2025-12-07T00:00:00Z',
        accessCount: 1,
      };

      dynamoMock.on(QueryCommand).resolves({
        Items: [mockDoc],
      });

      const result = await documentRepository.findByHashAndFilename('abc123', 'test.txt');

      expect(result).toEqual(mockDoc);
      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.IndexName).toBe('GSI1');
    });

    it('should return null when document not found', async () => {
      dynamoMock.on(QueryCommand).resolves({
        Items: [],
      });

      const result = await documentRepository.findByHashAndFilename('notfound', 'test.txt');

      expect(result).toBeNull();
    });

    it('should handle DynamoDB errors', async () => {
      dynamoMock.on(QueryCommand).rejects(new Error('DynamoDB error'));

      await expect(
        documentRepository.findByHashAndFilename('abc123', 'test.txt')
      ).rejects.toThrow('DynamoDB error');
    });
  });

  describe('create', () => {
    it('should create new document record', async () => {
      dynamoMock.on(PutCommand).resolves({});

      const doc: DocumentRecord = {
        documentId: 'new-id',
        userId: '1',
        contentHash: 'def456',
        filename: 'new.txt',
        s3Path: 's3://bucket/new.txt',
        s3Bucket: 'bucket',
        s3Key: 'documents/def456/new.txt',
        contentType: 'text/plain',
        fileSize: 200,
        uploadedAt: '2025-12-07T00:00:00Z',
        lastAccessedAt: '2025-12-07T00:00:00Z',
        accessCount: 1,
      };

      await documentRepository.create(doc);

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.Item).toMatchObject(doc);
      expect(call.args[0].input.Item.SK).toBe('METADATA');
    });

    it('should handle creation errors', async () => {
      dynamoMock.on(PutCommand).rejects(new Error('Creation failed'));

      const doc: DocumentRecord = {
        documentId: 'new-id',
        userId: '1',
        contentHash: 'def456',
        filename: 'new.txt',
        s3Path: 's3://bucket/new.txt',
        s3Bucket: 'bucket',
        s3Key: 'documents/def456/new.txt',
        contentType: 'text/plain',
        fileSize: 200,
        uploadedAt: '2025-12-07T00:00:00Z',
        lastAccessedAt: '2025-12-07T00:00:00Z',
        accessCount: 1,
      };

      await expect(documentRepository.create(doc)).rejects.toThrow('Creation failed');
    });
  });

  describe('findById', () => {
    it('should find document by ID', async () => {
      const mockDoc: DocumentRecord = {
        documentId: 'test-id',
        userId: '1',
        contentHash: 'abc123',
        filename: 'test.txt',
        s3Path: 's3://bucket/test.txt',
        s3Bucket: 'bucket',
        s3Key: 'documents/abc123/test.txt',
        contentType: 'text/plain',
        fileSize: 100,
        uploadedAt: '2025-12-07T00:00:00Z',
        lastAccessedAt: '2025-12-07T00:00:00Z',
        accessCount: 1,
      };

      dynamoMock.on(GetCommand).resolves({
        Item: mockDoc,
      });

      const result = await documentRepository.findById('test-id');

      expect(result).toEqual(mockDoc);
      expect(dynamoMock.calls()).toHaveLength(1);
    });

    it('should return null when document not found', async () => {
      dynamoMock.on(GetCommand).resolves({});

      const result = await documentRepository.findById('notfound');

      expect(result).toBeNull();
    });
  });

  describe('updateAccessMetadata', () => {
    it('should update lastAccessedAt and increment accessCount', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      await documentRepository.updateAccessMetadata('test-id');

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.UpdateExpression).toContain('lastAccessedAt');
      expect(call.args[0].input.UpdateExpression).toContain('accessCount');
    });

    it('should handle update errors', async () => {
      dynamoMock.on(UpdateCommand).rejects(new Error('Update failed'));

      await expect(
        documentRepository.updateAccessMetadata('test-id')
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document', async () => {
      dynamoMock.on(DeleteCommand).resolves({});

      await documentRepository.deleteDocument('test-id');

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.Key).toEqual({
        documentId: 'test-id',
        SK: 'METADATA',
      });
    });

    it('should handle deletion errors', async () => {
      dynamoMock.on(DeleteCommand).rejects(new Error('Deletion failed'));

      await expect(
        documentRepository.deleteDocument('test-id')
      ).rejects.toThrow('Deletion failed');
    });
  });
});
