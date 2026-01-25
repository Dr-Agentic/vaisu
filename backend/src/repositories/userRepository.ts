import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

import { env } from "../config/env.js";
import { calculateContentHash } from "../utils/hash.js";

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role?: string;
  passwordHash: string;
  status: "active" | "inactive" | "suspended" | "pending_verification";
  emailVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  subscriptionProvider?: string;
  subscriptionId?: string;
  subscriptionStatus?:
    | "active"
    | "canceled"
    | "past_due"
    | "incomplete"
    | "trialing";
  currentPeriodEnd?: string;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role?: string;
  passwordHash: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
  status?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  resetToken?: string;
  resetTokenExpiry?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  lastLogin?: string;
  deletedAt?: string;
  subscriptionProvider?: string;
  subscriptionId?: string;
  subscriptionStatus?:
    | "active"
    | "canceled"
    | "past_due"
    | "incomplete"
    | "trialing";
  currentPeriodEnd?: string;
}

const config = {
  region: env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
  },
};

export const dynamodb = DynamoDBDocumentClient.from(
  new DynamoDBClient(config),
  {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  },
);
const TABLE_NAME = "vaisu-users";

export class UserRepository {
  async createUser(input: CreateUserInput): Promise<User> {
    const userId = uuidv4();
    const now = new Date().toISOString();

    const user: User = {
      userId,
      email: input.email.toLowerCase(),
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash: input.passwordHash,
      role: input.role || "free",
      status: "pending_verification",
      emailVerified: false,
      verificationToken: uuidv4(),
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
    });

    await dynamodb.send(command);
    return user;
  }

  async getUserById(userId: string): Promise<User | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { userId },
    });

    const result = await dynamodb.send(command);
    if (!result.Item) return null;

    // Handle missing failedLoginAttempts for old records
    const user = result.Item as any;
    if (typeof user.failedLoginAttempts === "undefined") {
      user.failedLoginAttempts = 0;
    }

    return user as User;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email.toLowerCase(),
      },
    });

    const result = await dynamodb.send(command);
    if (result.Items && result.Items.length > 0) {
      // Handle missing failedLoginAttempts for old records
      const user = result.Items[0] as any;
      if (typeof user.failedLoginAttempts === "undefined") {
        user.failedLoginAttempts = 0;
      }
      return user as User;
    }
    return null;
  }

  async updateUser(userId: string, updates: UpdateUserInput): Promise<User> {
    const now = new Date().toISOString();
    const updateFields: string[] = ["#updatedAt = :updatedAt"];
    const expressionValues: Record<string, any> = {
      ":updatedAt": now,
    };
    const expressionAttributeNames: Record<string, string> = {
      "#updatedAt": "updatedAt",
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const attrName = `#${key}`;
        updateFields.push(`${attrName} = :${key}`);
        expressionValues[`:${key}`] = value;
        expressionAttributeNames[attrName] = key;
      }
    });

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId },
      UpdateExpression: `SET ${updateFields.join(", ")}`,
      ExpressionAttributeValues: expressionValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW",
    });

    const result = await dynamodb.send(command);
    return result.Attributes as User;
  }

  async deleteUser(userId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.updateUser(userId, { deletedAt: now, status: "inactive" });
  }

  async getActiveUsers(
    limit: number = 100,
    startKey?: string,
  ): Promise<{ users: User[]; lastKey?: string }> {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "active",
      },
      Limit: limit,
      ExclusiveStartKey: startKey ? { userId: startKey } : undefined,
    });

    const result = await dynamodb.send(command);
    return {
      users: (result.Items as User[]) || [],
      lastKey: result.LastEvaluatedKey?.userId as string,
    };
  }

  async verifyEmail(userId: string, token: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user || user.verificationToken !== token) {
      return false;
    }

    await this.updateUser(userId, {
      emailVerified: true,
      status: "active",
      verificationToken: undefined,
    });

    return true;
  }

  async resetPassword(
    userId: string,
    token: string,
    newPasswordHash: string,
  ): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user || user.resetToken !== token || !user.resetTokenExpiry) {
      return false;
    }

    const expiry = new Date(user.resetTokenExpiry);
    if (expiry < new Date()) {
      return false;
    }

    await this.updateUser(userId, {
      passwordHash: newPasswordHash,
      resetToken: undefined,
      resetTokenExpiry: undefined,
      failedLoginAttempts: 0,
    });

    return true;
  }

  async incrementFailedAttempts(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) return;

    // Handle case where failedLoginAttempts might be undefined (from old records)
    const currentAttempts = user.failedLoginAttempts || 0;
    const attempts = currentAttempts + 1;
    const updates: UpdateUserInput = { failedLoginAttempts: attempts };

    if (attempts >= 5) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 15);
      updates.lockedUntil = lockUntil.toISOString();
    }

    await this.updateUser(userId, updates);
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.updateUser(userId, {
      failedLoginAttempts: 0,
      lockedUntil: undefined,
    });
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user || !user.lockedUntil) return false;

    return new Date(user.lockedUntil) > new Date();
  }
}

export const userRepository = new UserRepository();
