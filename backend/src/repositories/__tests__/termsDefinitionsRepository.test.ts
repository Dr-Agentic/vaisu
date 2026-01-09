import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import * as termsDefinitionsRepository from '../termsDefinitionsRepository.js';

import type { VisualizationRecord } from '../types.js';

// Mock AWS config
vi.mock('../../config/aws.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../config/aws.js')>();
  return {
    ...actual,
    DYNAMODB_TERMS_DEFINITIONS_TABLE: 'test-terms-definitions-table',
  };
});

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe('termsDefinitionsRepository', () => {
  beforeEach(() => {
    dynamoMock.reset();
  });

  describe('create', () => {
    it('should create new terms and definitions record with correct SK', async () => {
      dynamoMock.on(PutCommand).resolves({});

      const visualization: VisualizationRecord = {
        documentId: 'test-doc-id',
        visualizationType: 'terms-definitions',
        visualizationData: { terms: [] },
        llmMetadata: {
          model: 'gpt-4',
          tokensUsed: 1200,
          processingTime: 6000,
          timestamp: '2025-01-01T00:00:00Z',
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      await termsDefinitionsRepository.create(visualization);

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.TableName).toBe('test-terms-definitions-table');
      expect(call.args[0].input.Item).toMatchObject(visualization);
      // Crucial check: Verify SK is 'TERMS_DEFINITIONS' and not 'terms-definitions' or 'type'
      expect(call.args[0].input.Item.SK).toBe('TERMS_DEFINITIONS');
    });
  });

  describe('findByDocumentId', () => {
    it('should find terms and definitions by document ID using correct Key', async () => {
      const mockViz: VisualizationRecord = {
        documentId: 'test-doc-id',
        visualizationType: 'terms-definitions',
        visualizationData: { terms: [] },
        llmMetadata: {
            model: 'gpt-4',
            tokensUsed: 1200,
            processingTime: 6000,
            timestamp: '2025-01-01T00:00:00Z',
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      dynamoMock.on(GetCommand).resolves({
        Item: mockViz,
      });

      const result = await termsDefinitionsRepository.findByDocumentId('test-doc-id');

      expect(result).toEqual(mockViz);
      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.TableName).toBe('test-terms-definitions-table');
      // Crucial check: Verify Key uses SK
      expect(call.args[0].input.Key).toEqual({
        documentId: 'test-doc-id',
        SK: 'TERMS_DEFINITIONS',
      });
    });

    it('should return null when not found', async () => {
      dynamoMock.on(GetCommand).resolves({});

      const result = await termsDefinitionsRepository.findByDocumentId('notfound');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update terms and definitions record with correct Key', async () => {
      dynamoMock.on(UpdateCommand).resolves({});

      const updates = {
        visualizationData: { terms: [{ term: 'Test', definition: 'Definition' }] },
      };

      await termsDefinitionsRepository.update('test-doc-id', updates);

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.TableName).toBe('test-terms-definitions-table');
      expect(call.args[0].input.Key).toEqual({
        documentId: 'test-doc-id',
        SK: 'TERMS_DEFINITIONS',
      });
      // Check that the update logic correctly maps attributes
      const expressionNames = call.args[0].input.ExpressionAttributeNames;
      const expressionValues = call.args[0].input.ExpressionAttributeValues;
      
      // Find which placeholder maps to 'visualizationData'
      const placeholder = Object.keys(expressionNames).find(key => expressionNames[key] === 'visualizationData');
      expect(placeholder).toBeDefined();
      
      // Verify the value matches
      const valuePlaceholder = placeholder!.replace('#attr', ':val');
      expect(expressionValues[valuePlaceholder]).toEqual(updates.visualizationData);
    });
  });

  describe('deleteTermsDefinitions', () => {
    it('should delete terms and definitions record with correct Key', async () => {
      dynamoMock.on(DeleteCommand).resolves({});

      await termsDefinitionsRepository.deleteTermsDefinitions('test-doc-id');

      expect(dynamoMock.calls()).toHaveLength(1);
      const call = dynamoMock.call(0);
      expect(call.args[0].input.TableName).toBe('test-terms-definitions-table');
      expect(call.args[0].input.Key).toEqual({
        documentId: 'test-doc-id',
        SK: 'TERMS_DEFINITIONS',
      });
    });
  });
});
