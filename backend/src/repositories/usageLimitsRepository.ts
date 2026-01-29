import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

import { env } from '../config/env.js';

export interface UsageLimits {
  userId: string;
  period: string; // e.g., '2026-01' for monthly
  documentCount: number;
  analysisCount: number;
  apiCalls: number;
  storageUsed: number; // in bytes
  resetDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageLimitsInput {
  userId: string;
  period: string;
  documentCount?: number;
  analysisCount?: number;
  apiCalls?: number;
  storageUsed?: number;
}

export interface UsageLimitConfig {
  maxDocuments: number;
  maxAnalyses: number;
  maxApiCalls: number;
  maxStorage: number; // in bytes
}

const config = {
  region: env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const dynamodb = new DynamoDBClient(config);
const TABLE_NAME = 'vaisu-usage-limits';

// Default usage limits
const DEFAULT_LIMITS: UsageLimitConfig = {
  maxDocuments: 100, // 100 documents per month
  maxAnalyses: 500, // 500 analyses per month
  maxApiCalls: 10000, // 10,000 API calls per month
  maxStorage: 1024 * 1024 * 1024, // 1GB storage
};

export class UsageLimitsRepository {
  private defaultLimits: UsageLimitConfig;

  constructor(limits?: UsageLimitConfig) {
    this.defaultLimits = limits || DEFAULT_LIMITS;
  }

  async getUsageLimits(
    userId: string,
    period: string,
  ): Promise<UsageLimits | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId, period },
    });

    const result = await dynamodb.send(command);
    return (result.Item as UsageLimits) || null;
  }

  async getCurrentUsage(userId: string): Promise<UsageLimits | null> {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.getUsageLimits(userId, period);
  }

  async getDailyUsage(userId: string): Promise<UsageLimits | null> {
    const now = new Date();
    const period = now.toISOString().split('T')[0];
    return this.getUsageLimits(userId, period);
  }

  async createUsageLimits(input: UsageLimitsInput): Promise<UsageLimits> {
    const now = new Date();
    const resetDate = new Date(now);

    // Determine reset date based on period format
    if (input.period.length === 10) {
      // YYYY-MM-DD
      resetDate.setDate(resetDate.getDate() + 1);
      resetDate.setHours(0, 0, 0, 0);
    } else {
      resetDate.setMonth(resetDate.getMonth() + 1);
      resetDate.setDate(1);
    }

    const usageLimits: UsageLimits = {
      userId: input.userId,
      period: input.period,
      documentCount: input.documentCount || 0,
      analysisCount: input.analysisCount || 0,
      apiCalls: input.apiCalls || 0,
      storageUsed: input.storageUsed || 0,
      resetDate: resetDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: usageLimits,
    });

    await dynamodb.send(command);
    return usageLimits;
  }

  async incrementDocumentCount(
    userId: string,
    amount: number = 1,
  ): Promise<UsageLimits> {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const existing = await this.getUsageLimits(userId, period);
    if (!existing) {
      return this.createUsageLimits({ userId, period, documentCount: amount });
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, period },
      UpdateExpression:
        'SET documentCount = documentCount + :amount, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':amount': amount,
        ':updatedAt': now.toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamodb.send(command);
    return result.Attributes as UsageLimits;
  }

  async incrementAnalysisCount(
    userId: string,
    amount: number = 1,
  ): Promise<UsageLimits> {
    const now = new Date();
    // Use daily bucket for analysis (YYYY-MM-DD)
    const period = now.toISOString().split('T')[0];

    const existing = await this.getUsageLimits(userId, period);
    if (!existing) {
      return this.createUsageLimits({ userId, period, analysisCount: amount });
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, period },
      UpdateExpression:
        'SET analysisCount = analysisCount + :amount, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':amount': amount,
        ':updatedAt': now.toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamodb.send(command);
    return result.Attributes as UsageLimits;
  }

  async incrementApiCalls(
    userId: string,
    amount: number = 1,
  ): Promise<UsageLimits> {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const existing = await this.getUsageLimits(userId, period);
    if (!existing) {
      return this.createUsageLimits({ userId, period, apiCalls: amount });
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, period },
      UpdateExpression:
        'SET apiCalls = apiCalls + :amount, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':amount': amount,
        ':updatedAt': now.toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamodb.send(command);
    return result.Attributes as UsageLimits;
  }

  async incrementStorageUsed(
    userId: string,
    bytes: number,
  ): Promise<UsageLimits> {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const existing = await this.getUsageLimits(userId, period);
    if (!existing) {
      return this.createUsageLimits({ userId, period, storageUsed: bytes });
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, period },
      UpdateExpression:
        'SET storageUsed = storageUsed + :bytes, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':bytes': bytes,
        ':updatedAt': now.toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamodb.send(command);
    return result.Attributes as UsageLimits;
  }

  async checkLimits(
    userId: string,
    limits: UsageLimitConfig = this.defaultLimits,
  ): Promise<{ allowed: boolean; exceeded: string[] }> {
    const current = await this.getCurrentUsage(userId);
    if (!current) {
      return { allowed: true, exceeded: [] };
    }

    const exceeded: string[] = [];

    if (current.documentCount >= limits.maxDocuments) {
      exceeded.push('documents');
    }
    if (current.analysisCount >= limits.maxAnalyses) {
      exceeded.push('analyses');
    }
    if (current.apiCalls >= limits.maxApiCalls) {
      exceeded.push('api_calls');
    }
    if (current.storageUsed >= limits.maxStorage) {
      exceeded.push('storage');
    }

    return {
      allowed: exceeded.length === 0,
      exceeded,
    };
  }

  async resetPeriodicUsage(): Promise<void> {
    // This would typically be run as a scheduled job at the start of each month
    // For now, we'll just log that it should be done
    console.log('Periodic usage reset should be performed by a scheduled job');
  }

  async getUsageHistory(
    userId: string,
    limit: number = 12,
  ): Promise<UsageLimits[]> {
    // Get last N periods of usage
    const now = new Date();
    const periods: string[] = [];

    for (let i = 0; i < limit; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      periods.push(
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      );
    }

    const results: UsageLimits[] = [];
    for (const period of periods) {
      const usage = await this.getUsageLimits(userId, period);
      if (usage) {
        results.push(usage);
      }
    }

    return results;
  }
}

export const usageLimitsRepository = new UsageLimitsRepository();
