import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

import { env } from '../config/env.js';

export interface AuditLog {
  logId: string;
  userId: string;
  action: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface CreateAuditLogInput {
  userId: string;
  action: string;
  resourceId?: string;
  resourceType?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const config = {
  region: env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const dynamodb = new DynamoDBClient(config);
const TABLE_NAME = 'vaisu-audit-logs';

export class AuditLogsRepository {
  async createLog(input: CreateAuditLogInput): Promise<AuditLog> {
    const logId = uuidv4();
    const timestamp = new Date().toISOString();

    const log: AuditLog = {
      logId,
      userId: input.userId,
      action: input.action,
      resourceId: input.resourceId,
      resourceType: input.resourceType,
      details: input.details,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      timestamp,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: log,
    });

    await dynamodb.send(command);
    return log;
  }

  async getLogsByUserId(userId: string, limit: number = 100, startKey?: string): Promise<{ logs: AuditLog[]; lastKey?: string }> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: limit,
      ScanIndexForward: false, // Most recent first
      ExclusiveStartKey: startKey ? { logId: startKey } : undefined,
    });

    const result = await dynamodb.send(command);
    return {
      logs: (result.Items as AuditLog[]) || [],
      lastKey: result.LastEvaluatedKey?.logId as string,
    };
  }

  async getLogsByAction(action: string, limit: number = 100, startKey?: string): Promise<{ logs: AuditLog[]; lastKey?: string }> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'action = :action',
      ExpressionAttributeValues: {
        ':action': action,
      },
      Limit: limit,
      ScanIndexForward: false, // Most recent first
      ExclusiveStartKey: startKey ? { logId: startKey } : undefined,
    });

    const result = await dynamodb.send(command);
    return {
      logs: (result.Items as AuditLog[]) || [],
      lastKey: result.LastEvaluatedKey?.logId as string,
    };
  }

  async getLogsByResource(resourceType: string, resourceId: string, limit: number = 100): Promise<AuditLog[]> {
    // This would require a scan with filter, which is not efficient in DynamoDB
    // For production, you'd want to add a GSI for resourceType/resourceId
    // For now, we'll return an empty array
    return [];
  }

  async getLogsByDateRange(startDate: string, endDate: string, limit: number = 100): Promise<AuditLog[]> {
    // This would require a scan with filter, which is not efficient in DynamoDB
    // For production, you'd want to add a GSI for timestamp
    // For now, we'll return an empty array
    return [];
  }

  // Common audit log actions
  async logUserRegistration(userId: string, email: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'USER_REGISTRATION',
      details: { email },
      ipAddress,
      userAgent,
    });
  }

  async logUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'USER_LOGIN',
      ipAddress,
      userAgent,
    });
  }

  async logUserLogout(userId: string, sessionId?: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'USER_LOGOUT',
      details: { sessionId },
      ipAddress,
      userAgent,
    });
  }

  async logPasswordReset(userId: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'PASSWORD_RESET',
      ipAddress,
      userAgent,
    });
  }

  async logEmailVerification(userId: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'EMAIL_VERIFICATION',
      ipAddress,
      userAgent,
    });
  }

  async logDocumentUpload(userId: string, documentId: string, fileName: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'DOCUMENT_UPLOAD',
      resourceId: documentId,
      resourceType: 'document',
      details: { fileName },
      ipAddress,
      userAgent,
    });
  }

  async logDocumentAnalysis(userId: string, documentId: string, analysisType: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'DOCUMENT_ANALYSIS',
      resourceId: documentId,
      resourceType: 'document',
      details: { analysisType },
      ipAddress,
      userAgent,
    });
  }

  async logAccountDeletion(userId: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'ACCOUNT_DELETION',
      ipAddress,
      userAgent,
    });
  }

  async logFailedLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'FAILED_LOGIN',
      ipAddress,
      userAgent,
    });
  }

  async logRoleChange(userId: string, newRole: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'ROLE_CHANGE',
      details: { newRole },
      ipAddress,
      userAgent,
    });
  }

  async logUsageLimitExceeded(userId: string, limitType: string, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    return this.createLog({
      userId,
      action: 'USAGE_LIMIT_EXCEEDED',
      details: { limitType },
      ipAddress,
      userAgent,
    });
  }
}

export const auditLogsRepository = new AuditLogsRepository();
