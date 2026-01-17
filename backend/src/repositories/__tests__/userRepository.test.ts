import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, PutItemCommand, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { userRepository } from '../userRepository.js';

const ddbMock = mockClient(DynamoDBClient);

describe('UserRepository', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      ddbMock.on(PutItemCommand).resolves({});

      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
      };

      const user = await userRepository.createUser(userData);

      expect(user).toBeDefined();
      expect(user.userId).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('free');
      expect(user.status).toBe('pending_verification');
      expect(ddbMock.calls()).toHaveLength(1);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = {
        userId: '123',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: 'free',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      ddbMock.on(QueryCommand).resolves({
        Items: [marshall(mockUser)],
      });

      const user = await userRepository.getUserByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null when not found', async () => {
      ddbMock.on(QueryCommand).resolves({
        Items: [],
      });

      const user = await userRepository.getUserByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        userId: '123',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: 'free',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      ddbMock.on(GetItemCommand).resolves({
        Item: marshall(mockUser),
      });

      const user = await userRepository.getUserById('123');

      expect(user).toBeDefined();
      expect(user?.userId).toBe('123');
    });

    it('should return null when not found', async () => {
      ddbMock.on(GetItemCommand).resolves({});

      const user = await userRepository.getUserById('nonexistent');

      expect(user).toBeNull();
    });
  });
});
