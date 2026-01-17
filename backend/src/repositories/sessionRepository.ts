import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';

export interface Session {
  sessionId: string;
  userId: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  expiresAt: string;
  revoked: boolean;
}

export interface CreateSessionInput {
  userId: string;
  refreshToken: string;
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
const TABLE_NAME = 'vaisu-sessions';

export class SessionRepository {
  async createSession(input: CreateSessionInput): Promise<Session> {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    const session: Session = {
      sessionId,
      userId: input.userId,
      refreshToken: input.refreshToken,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      revoked: false,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: session,
    });

    await dynamodb.send(command);
    return session;
  }

  async getSessionById(sessionId: string): Promise<Session | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { sessionId },
    });

    const result = await dynamodb.send(command);
    return (result.Item as Session) || null;
  }

  async getSessionsByUserId(userId: string, limit: number = 50): Promise<Session[]> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: limit,
      ScanIndexForward: false, // Most recent first
    });

    const result = await dynamodb.send(command);
    return (result.Items as Session[]) || [];
  }

  async revokeSession(sessionId: string): Promise<void> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { sessionId },
      UpdateExpression: 'SET revoked = :revoked',
      ExpressionAttributeValues: {
        ':revoked': true,
      },
    });

    await dynamodb.send(command);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.getSessionsByUserId(userId, 100);
    for (const session of sessions) {
      if (!session.revoked) {
        await this.revokeSession(session.sessionId);
      }
    }
  }

  async revokeExpiredSessions(): Promise<number> {
    const now = new Date().toISOString();
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': 'dummy', // We need to scan all, but DynamoDB doesn't support full table scan with Query
      },
    });

    // For production, you'd want to use a scan with filter or a scheduled job
    // This is a simplified version
    return 0;
  }

  async isSessionValid(sessionId: string): Promise<boolean> {
    const session = await this.getSessionById(sessionId);
    if (!session || session.revoked) return false;

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    return now < expiresAt;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { sessionId },
    });

    await dynamodb.send(command);
  }

  async cleanupExpiredSessions(): Promise<number> {
    // This would typically be run as a scheduled job
    // For now, we'll just return 0
    return 0;
  }
}

export const sessionRepository = new SessionRepository();
