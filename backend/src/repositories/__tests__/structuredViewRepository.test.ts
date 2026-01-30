import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { describe, it, expect, beforeEach } from 'vitest';

import * as structuredViewRepository from '../structuredViewRepository.js';

import type { VisualizationRecord } from '../types.js';

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe('structuredViewRepository', () => {
  beforeEach(() => {
    dynamoMock.reset();
  });

  const mockDocumentId = 'test-doc-123';
  const mockRecord: VisualizationRecord = {
    documentId: mockDocumentId,
    SK: 'STRUCTURED_VIEW',
    data: {
      type: 'structured-view',
      sections: [],
      metadata: {}
    },
    createdAt: '2025-12-07T00:00:00Z',
    updatedAt: '2025-12-07T00:00:00Z'
  };

  describe('create', () => {
    it('should create a new structured-view record', async () => {
      dynamoMock.on(PutCommand).resolves({});

      await structuredViewRepository.create(mockRecord);

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.Item).toMatchObject(mockRecord);
      expect(call.args[0].input.Item.SK).toBe('STRUCTURED_VIEW');
    });

    it('should handle creation errors', async () => {
      dynamoMock.on(PutCommand).rejects(new Error('Creation failed'));

      await expect(structuredViewRepository.create(mockRecord)).rejects.toThrow('Creation failed');
    });
  });

  describe('findByDocumentId', () => {
    it('should find a structured-view by document ID', async () => {
      dynamoMock.on(GetCommand).resolves({
        Item: mockRecord,
      });

      const result = await structuredViewRepository.findByDocumentId(mockDocumentId);

      expect(result).toEqual(mockRecord);
      expect(dynamoMock.calls()).toHaveLength(1);
      
      const expectedCommand = new GetCommand({
        TableName: 'vaisu-structured-views',
        Key: {
          documentId: mockDocumentId,
          SK: 'STRUCTURED_VIEW',
        },
      });
      
      expect(dynamoMock.calls()[0].args[0].input).toEqual(expectedCommand.input);
    });

    it('should return null when no record is found', async () => {
      dynamoMock.on(GetCommand).resolves({});

      const result = await structuredViewRepository.findByDocumentId(mockDocumentId);

      expect(result).toBeNull();
    });

    it('should handle query errors', async () => {
      dynamoMock.on(GetCommand).rejects(new Error('Query failed'));

      await expect(structuredViewRepository.findByDocumentId(mockDocumentId))
        .rejects.toThrow('Query failed');
    });
  });

  describe('update', () => {
    it('should update an existing structured-view record', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      const updates = {
        data: {
          type: 'structured-view',
          sections: [{ title: 'Updated Section' }],
          metadata: { version: 2 }
        },
        updatedAt: '2025-12-07T01:00:00Z'
      };

      await structuredViewRepository.update(mockDocumentId, updates);

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      
      const expectedCommand = new UpdateCommand({
        TableName: 'vaisu-structured-views',
        Key: {
          documentId: mockDocumentId,
          SK: 'STRUCTURED_VIEW',
        },
        UpdateExpression: 'SET #attr0 = :val0, #attr1 = :val1',
        ExpressionAttributeNames: {
          '#attr0': 'data',
          '#attr1': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':val0': updates.data,
          ':val1': updates.updatedAt
        },
      });
      
      expect(call.args[0].input).toEqual(expectedCommand.input);
    });

    it('should skip update if no valid fields provided', async () => {
      await structuredViewRepository.update(mockDocumentId, { documentId: 'ignored', SK: 'ignored' } as any);

      expect(dynamoMock.calls()).toHaveLength(0);
    });

    it('should handle update errors', async () => {
      dynamoMock.on(UpdateCommand).rejects(new Error('Update failed'));

      await expect(structuredViewRepository.update(mockDocumentId, { data: { test: 'value' } }))
        .rejects.toThrow('Update failed');
    });
  });

  describe('deleteVisualization', () => {
    it('should delete a structured-view record', async () => {
      dynamoMock.on(DeleteCommand).resolves({});

      await structuredViewRepository.deleteVisualization(mockDocumentId);

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      
      const expectedCommand = new DeleteCommand({
        TableName: 'vaisu-structured-views',
        Key: {
          documentId: mockDocumentId,
          SK: 'STRUCTURED_VIEW',
        },
      });
      
      expect(call.args[0].input).toEqual(expectedCommand.input);
    });

    it('should handle deletion errors', async () => {
      dynamoMock.on(DeleteCommand).rejects(new Error('Deletion failed'));

      await expect(structuredViewRepository.deleteVisualization(mockDocumentId))
        .rejects.toThrow('Deletion failed');
    });
  });
});
