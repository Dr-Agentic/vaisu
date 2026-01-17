import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  CreateTableCommand,
  DynamoDBClientConfig,
  DescribeTableCommand,
  UpdateTableCommand,
} from '@aws-sdk/client-dynamodb';
import { env } from '../config/env.js';
import { fileURLToPath } from 'url';

const config: DynamoDBClientConfig = {
  region: env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
};

const dynamodb = new DynamoDBClient(config);

const TABLES = [
  {
    TableName: 'vaisu-users',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'GSI2',
        KeySchema: [
          { AttributeName: 'status', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'vaisu-sessions',
    KeySchema: [
      { AttributeName: 'sessionId', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'sessionId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'vaisu-usage-limits',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
      { AttributeName: 'period', KeyType: 'RANGE' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'period', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: 'vaisu-audit-logs',
    KeySchema: [
      { AttributeName: 'logId', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'logId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'action', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'GSI2',
        KeySchema: [
          { AttributeName: 'action', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function ensureTable(tableConfig: any) {
  const tableName = tableConfig.TableName;
  console.log(`\nChecking table: ${tableName}`);

  try {
    const describeCommand = new DescribeTableCommand({ TableName: tableName });
    const { Table } = await dynamodb.send(describeCommand);

    if (Table) {
      // Check if BillingModeSummary exists, if not it defaults to PROVISIONED
      const currentBillingMode = Table.BillingModeSummary?.BillingMode || 'PROVISIONED';
      
      if (currentBillingMode !== 'PAY_PER_REQUEST') {
        console.log(`  ⚠️ Table exists but is ${currentBillingMode}. Updating to PAY_PER_REQUEST...`);
        const updateCommand = new UpdateTableCommand({
          TableName: tableName,
          BillingMode: 'PAY_PER_REQUEST',
        });
        await dynamodb.send(updateCommand);
        console.log(`  ✅ Table updated to PAY_PER_REQUEST: ${tableName}`);
      } else {
        console.log(`  ✅ Table already exists and is PAY_PER_REQUEST: ${tableName}`);
      }
      return;
    }
  } catch (error: any) {
    if (error.name !== 'ResourceNotFoundException') {
      console.error(`  ❌ Error checking table ${tableName}:`, error);
      throw error;
    }
  }

  console.log(`  🔄 Creating table: ${tableName}`);
  try {
    const command = new CreateTableCommand(tableConfig);
    await dynamodb.send(command);
    console.log(`  ✅ Table created: ${tableName}`);
  } catch (error) {
    console.error(`  ❌ Error creating table ${tableName}:`, error);
    throw error;
  }
}

async function setupUserManagementTables() {
  console.log('🚀 Setting up User Management DynamoDB Tables (On-Demand)');
  console.log('=========================================================');

  for (const tableConfig of TABLES) {
    await ensureTable(tableConfig);
  }

  console.log('\n✅ All user management tables setup complete!');
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  setupUserManagementTables().catch(console.error);
}

export { setupUserManagementTables };
