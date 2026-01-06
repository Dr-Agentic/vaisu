import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { describe, it, expect, beforeEach } from 'vitest';

import * as analysisRepository from '../analysisRepository.js';

import type { AnalysisRecord } from '../types.js';

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe('analysisRepository', () => {
  beforeEach(() => {
    dynamoMock.reset();
  });

  describe('create', () => {
    it('should create new analysis record', async () => {
      dynamoMock.on(PutCommand).resolves({});

      const analysis: AnalysisRecord = {
        documentId: 'test-id',
        analysisVersion: 'v1.0',
        analysis: {
          tldr: { text: 'Test summary', confidence: 0.9, generatedAt: '2025-12-07T00:00:00Z', model: 'test-model' },
          executiveSummary: {
            headline: 'Test',
            keyIdeas: [],
            kpis: [],
            risks: [],
            opportunities: [],
            callToAction: 'Test',
          },
          entities: [],
          relationships: [],
          metrics: [],
          signals: {
            structural: 0.5,
            process: 0.5,
            quantitative: 0.5,
            technical: 0.5,
            argumentative: 0.5,
            temporal: 0.5,
          },
          recommendations: [],
        },
        llmMetadata: {
          model: 'test-model',
          tokensUsed: 100,
          processingTime: 1000,
          timestamp: '2025-12-07T00:00:00Z',
        },
        createdAt: '2025-12-07T00:00:00Z',
      };

      await analysisRepository.create(analysis);

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.Item).toMatchObject(analysis);
      expect(call.args[0].input.Item.SK).toBe('ANALYSIS');
    });

    it('should handle creation errors', async () => {
      dynamoMock.on(PutCommand).rejects(new Error('Creation failed'));

      const analysis: AnalysisRecord = {
        documentId: 'test-id',
        analysisVersion: 'v1.0',
        analysis: {} as any,
        llmMetadata: {
          model: 'test-model',
          tokensUsed: 100,
          processingTime: 1000,
          timestamp: '2025-12-07T00:00:00Z',
        },
        createdAt: '2025-12-07T00:00:00Z',
      };

      await expect(analysisRepository.create(analysis)).rejects.toThrow('Creation failed');
    });
  });

  describe('findByDocumentId', () => {
    it('should find analysis by document ID', async () => {
      const mockAnalysis: AnalysisRecord = {
        documentId: 'test-id',
        analysisVersion: 'v1.0',
        analysis: {
          tldr: { text: 'Test', confidence: 0.9, generatedAt: '2025-12-07T00:00:00Z', model: 'test-model' },
          executiveSummary: {
            headline: 'Test',
            keyIdeas: [],
            kpis: [],
            risks: [],
            opportunities: [],
            callToAction: 'Test',
          },
          entities: [],
          relationships: [],
          metrics: [],
          signals: {
            structural: 0.5,
            process: 0.5,
            quantitative: 0.5,
            technical: 0.5,
            argumentative: 0.5,
            temporal: 0.5,
          },
          recommendations: [],
        },
        llmMetadata: {
          model: 'test-model',
          tokensUsed: 100,
          processingTime: 1000,
          timestamp: '2025-12-07T00:00:00Z',
        },
        createdAt: '2025-12-07T00:00:00Z',
      };

      dynamoMock.on(GetCommand).resolves({
        Item: mockAnalysis,
      });

      const result = await analysisRepository.findByDocumentId('test-id');

      expect(result).toEqual(mockAnalysis);
      expect(dynamoMock.calls()).toHaveLength(1);
    });

    it('should return null when analysis not found', async () => {
      dynamoMock.on(GetCommand).resolves({});

      const result = await analysisRepository.findByDocumentId('notfound');

      expect(result).toBeNull();
    });

    it('should handle query errors', async () => {
      dynamoMock.on(GetCommand).rejects(new Error('Query failed'));

      await expect(
        analysisRepository.findByDocumentId('test-id'),
      ).rejects.toThrow('Query failed');
    });
  });

  describe('update', () => {
    it('should update analysis record', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      const updates = {
        analysisVersion: 'v2.0',
      };

      await analysisRepository.update('test-id', updates);

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.UpdateExpression).toBeDefined();
    });

    it('should skip update if no valid fields provided', async () => {
      await analysisRepository.update('test-id', { documentId: 'ignored', SK: 'ignored' } as any);

      expect(dynamoMock.calls()).toHaveLength(0);
    });

    it('should handle update errors', async () => {
      dynamoMock.on(UpdateCommand).rejects(new Error('Update failed'));

      await expect(
        analysisRepository.update('test-id', { analysisVersion: 'v2.0' }),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteAnalysis', () => {
    it('should delete analysis', async () => {
      dynamoMock.on(DeleteCommand).resolves({});

      await analysisRepository.deleteAnalysis('test-id');

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.Key).toEqual({
        documentId: 'test-id',
        SK: 'ANALYSIS',
      });
    });

    it('should handle deletion errors', async () => {
      dynamoMock.on(DeleteCommand).rejects(new Error('Deletion failed'));

      await expect(
        analysisRepository.deleteAnalysis('test-id'),
      ).rejects.toThrow('Deletion failed');
    });
  });
});
