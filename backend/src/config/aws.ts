import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { env } from './env.js';

// Environment variables are now strictly loaded via env.ts
export function getAWSRegion() {
  return env.AWS_REGION;
}

export function getAWSAccessKeyId() {
  return env.AWS_ACCESS_KEY_ID;
}

export function getAWSSecretAccessKey() {
  return env.AWS_SECRET_ACCESS_KEY;
}

// DynamoDB Configuration
export const S3_BUCKET_NAME = env.S3_BUCKET_NAME;

// DynamoDB Configuration
export const DYNAMODB_DOCUMENTS_TABLE = env.DYNAMODB_DOCUMENTS_TABLE;
export const DYNAMODB_ANALYSES_TABLE
  = env.DYNAMODB_ANALYSES_TABLE || 'vaisu-analyses'; // Fallback allowed if env.ts allows it, but env.ts has defaults.

// Visualization tables (one per representation model)
// Assuming these are added to env.ts or we pull them from process.env if not strict yet.
// For now, let's keep them as is but reading from env object if we added them there,
// OR we should add them to env.ts.
// I didn't add them to env.ts in the first step. Let's fix that first.

// Wait, I did NOT add all these tables to env.ts. I should probably add them there for completeness.
// But the user focused on PORTS.
// For now, I will leave the tables as process.env checks OR I should update env.ts to include them.
// To avoid breaking changes if I miss one, I will defer moving ALL tables to env.ts unless I'm sure.
// However, the AWS credentials MUST come from env.ts to ensure strictness if that's the goal.

// Let's stick to using env.ts for what is there, and process.env for the rest for now,
// BUT imports might fail if env.ts throws on load.
// Since env.ts loads dotenv, importing it here guarantees dotenv is loaded.

export const DYNAMODB_ARGUMENT_MAP_TABLE
  = process.env.DYNAMODB_ARGUMENT_MAP_TABLE || 'vaisu-argument-map';
export const DYNAMODB_DEPTH_GRAPH_TABLE
  = process.env.DYNAMODB_DEPTH_GRAPH_TABLE || 'vaisu-depth-graph';
export const DYNAMODB_UML_CLASS_TABLE
  = process.env.DYNAMODB_UML_CLASS_TABLE || 'vaisu-uml-class';
export const DYNAMODB_MIND_MAP_TABLE
  = process.env.DYNAMODB_MIND_MAP_TABLE || 'vaisu-mind-map';
export const DYNAMODB_FLOWCHART_TABLE
  = process.env.DYNAMODB_FLOWCHART_TABLE || 'vaisu-flowchart';
export const DYNAMODB_EXECUTIVE_DASHBOARD_TABLE
  = process.env.DYNAMODB_EXECUTIVE_DASHBOARD_TABLE || 'vaisu-executive-dashboard';
export const DYNAMODB_TIMELINE_TABLE
  = process.env.DYNAMODB_TIMELINE_TABLE || 'vaisu-timeline';
export const DYNAMODB_TERMS_DEFINITIONS_TABLE
  = process.env.DYNAMODB_TERMS_DEFINITIONS_TABLE || 'vaisu-terms-definitions';
export const DYNAMODB_KNOWLEDGE_GRAPH_TABLE
  = process.env.DYNAMODB_KNOWLEDGE_GRAPH_TABLE || 'vaisu-knowledge-graph';
export const DYNAMODB_ENTITY_GRAPH_TABLE
  = process.env.DYNAMODB_ENTITY_GRAPH_TABLE || 'vaisu-entity-graph';

// User Management tables
export const DYNAMODB_USERS_TABLE
  = process.env.DYNAMODB_USERS_TABLE || 'vaisu-users';
export const DYNAMODB_SESSIONS_TABLE
  = process.env.DYNAMODB_SESSIONS_TABLE || 'vaisu-sessions';
export const DYNAMODB_USER_LIMITS_TABLE
  = process.env.DYNAMODB_USER_LIMITS_TABLE || 'vaisu-user-limits';
/**
 * Validate AWS configuration
 * Throws error if persistence is enabled but configuration is invalid
 */
export function validateAWSConfig(): void {
  const accessKeyId = getAWSAccessKeyId();
  const secretAccessKey = getAWSSecretAccessKey();

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
    );
  }

  if (!S3_BUCKET_NAME) {
    throw new Error('S3_BUCKET_NAME not configured');
  }

  if (!DYNAMODB_DOCUMENTS_TABLE || !DYNAMODB_ANALYSES_TABLE) {
    throw new Error('DynamoDB table names not configured');
  }

  if (
    !DYNAMODB_USERS_TABLE
    || !DYNAMODB_SESSIONS_TABLE
    || !DYNAMODB_USER_LIMITS_TABLE
  ) {
    throw new Error('User management table names not configured');
  }

  // Validate all visualization table names exist
  const allVisualizationTables = [
    DYNAMODB_ARGUMENT_MAP_TABLE,
    DYNAMODB_DEPTH_GRAPH_TABLE,
    DYNAMODB_UML_CLASS_TABLE,
    DYNAMODB_MIND_MAP_TABLE,
    DYNAMODB_FLOWCHART_TABLE,
    DYNAMODB_EXECUTIVE_DASHBOARD_TABLE,
    DYNAMODB_TIMELINE_TABLE,
    DYNAMODB_TERMS_DEFINITIONS_TABLE,
    DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    DYNAMODB_ENTITY_GRAPH_TABLE,
  ];

  const invalidTables = allVisualizationTables.filter((table) => !table);
  if (invalidTables.length > 0) {
    throw new Error(
      `Visualization table names not configured: ${invalidTables.join(', ')}`,
    );
  }

  console.info('✅ AWS configuration:', {
    region: getAWSRegion(),
    s3Bucket: S3_BUCKET_NAME,
    documentsTable: DYNAMODB_DOCUMENTS_TABLE,
    analysesTable: DYNAMODB_ANALYSES_TABLE,
    visualizationTables: {
      argumentMap: DYNAMODB_ARGUMENT_MAP_TABLE,
      depthGraph: DYNAMODB_DEPTH_GRAPH_TABLE,
      umlClass: DYNAMODB_UML_CLASS_TABLE,
      mindMap: DYNAMODB_MIND_MAP_TABLE,
      flowchart: DYNAMODB_FLOWCHART_TABLE,
      executiveDashboard: DYNAMODB_EXECUTIVE_DASHBOARD_TABLE,
      timeline: DYNAMODB_TIMELINE_TABLE,
      termsDefinitions: DYNAMODB_TERMS_DEFINITIONS_TABLE,
      knowledgeGraph: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
      entityGraph: DYNAMODB_ENTITY_GRAPH_TABLE,
    },
    userManagementTables: {
      users: DYNAMODB_USERS_TABLE,
      sessions: DYNAMODB_SESSIONS_TABLE,
      userLimits: DYNAMODB_USER_LIMITS_TABLE,
    },
  });
}

/**
 * Initialize S3 client
 */
export function createS3Client(): S3Client {
  const accessKeyId = getAWSAccessKeyId();
  const secretAccessKey = getAWSSecretAccessKey();

  return new S3Client({
    region: getAWSRegion(),
    credentials:
      accessKeyId && secretAccessKey
        ? {
          accessKeyId,
          secretAccessKey,
        }
        : undefined,
  });
}

/**
 * Initialize DynamoDB client with Document Client wrapper
 */
export function createDynamoDBClient(): DynamoDBDocumentClient {
  const accessKeyId = getAWSAccessKeyId();
  const secretAccessKey = getAWSSecretAccessKey();

  const client = new DynamoDBClient({
    region: getAWSRegion(),
    credentials:
      accessKeyId && secretAccessKey
        ? {
          accessKeyId,
          secretAccessKey,
        }
        : undefined,
  });

  // Wrap with Document Client for easier JSON handling
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });
}

// Lazy singleton instances (created on first access to ensure env vars are loaded)
let _s3Client: S3Client | null = null;
let _dynamoDBClient: DynamoDBDocumentClient | null = null;

export function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = createS3Client();
  }
  return _s3Client;
}

export function getDynamoDBClient(): DynamoDBDocumentClient {
  if (!_dynamoDBClient) {
    _dynamoDBClient = createDynamoDBClient();
  }
  return _dynamoDBClient;
}

// Legacy exports for backward compatibility
export const s3Client = new Proxy({} as S3Client, {
  get(target, prop) {
    return (getS3Client() as any)[prop];
  },
});

export const dynamoDBClient = new Proxy({} as DynamoDBDocumentClient, {
  get(target, prop) {
    return (getDynamoDBClient() as any)[prop];
  },
});
