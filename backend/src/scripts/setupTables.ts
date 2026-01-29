#!/usr/bin/env tsx

import dotenv from 'dotenv';
dotenv.config();

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTableCommand,
} from '@aws-sdk/client-dynamodb';

import {
  DYNAMODB_DOCUMENTS_TABLE,
  DYNAMODB_ANALYSES_TABLE,
  DYNAMODB_ARGUMENT_MAP_TABLE,
  DYNAMODB_DEPTH_GRAPH_TABLE,
  DYNAMODB_UML_CLASS_TABLE,
  DYNAMODB_MIND_MAP_TABLE,
  DYNAMODB_FLOWCHART_TABLE,
  DYNAMODB_EXECUTIVE_DASHBOARD_TABLE,
  DYNAMODB_TIMELINE_TABLE,
  DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
  DYNAMODB_TERMS_DEFINITIONS_TABLE,
  DYNAMODB_ENTITY_GRAPH_TABLE,
  getAWSRegion,
  getAWSAccessKeyId,
  getAWSSecretAccessKey,
} from '../config/aws.js';

interface TableConfig {
  name: string;
  primaryKey: string;
  sortKey?: string;
  billingMode?: 'PAY_PER_REQUEST' | 'PROVISIONED';
}

const tables: TableConfig[] = [
  {
    name: DYNAMODB_DOCUMENTS_TABLE,
    primaryKey: 'id',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_ANALYSES_TABLE,
    primaryKey: 'id',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_ARGUMENT_MAP_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_DEPTH_GRAPH_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_UML_CLASS_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_MIND_MAP_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_FLOWCHART_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_EXECUTIVE_DASHBOARD_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_TIMELINE_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_TERMS_DEFINITIONS_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: DYNAMODB_ENTITY_GRAPH_TABLE,
    primaryKey: 'documentId',
    sortKey: 'type',
    billingMode: 'PAY_PER_REQUEST',
  },
];

async function ensureTable(client: DynamoDBClient, config: TableConfig) {
  console.log(`📦 Checking table: ${config.name}`);

  try {
    const describeCommand = new DescribeTableCommand({
      TableName: config.name,
    });
    const { Table } = await client.send(describeCommand);

    if (Table) {
      const currentBillingMode
        = Table.BillingModeSummary?.BillingMode || 'PROVISIONED';

      if (currentBillingMode !== 'PAY_PER_REQUEST') {
        console.log(
          `  ⚠️ Table exists but is ${currentBillingMode}. Updating to PAY_PER_REQUEST...`,
        );
        const updateCommand = new UpdateTableCommand({
          TableName: config.name,
          BillingMode: 'PAY_PER_REQUEST',
        });
        await client.send(updateCommand);
        console.log(`  ✅ Table updated to PAY_PER_REQUEST: ${config.name}`);
      } else {
        console.log(
          `  ✅ Table already exists and is PAY_PER_REQUEST: ${config.name}`,
        );
      }
      return;
    }
  } catch (error: any) {
    if (error.name !== 'ResourceNotFoundException') {
      console.error(`❌ Error checking table ${config.name}:`, error);
      throw error;
    }
  }

  console.log(`🏗️  Creating table: ${config.name}`);

  const command = new CreateTableCommand({
    TableName: config.name,
    KeySchema: [
      {
        AttributeName: config.primaryKey,
        KeyType: 'HASH',
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: config.primaryKey,
        AttributeType: 'S',
      },
    ],
    BillingMode: config.billingMode || 'PAY_PER_REQUEST',
  });

  // Add sort key if specified
  if (config.sortKey) {
    command.input.KeySchema!.push({
      AttributeName: config.sortKey,
      KeyType: 'RANGE',
    });
    command.input.AttributeDefinitions!.push({
      AttributeName: config.sortKey,
      AttributeType: 'S',
    });
  }

  try {
    await client.send(command);
    console.log(`✅ Table created: ${config.name}`);
  } catch (error: any) {
    console.error(`❌ Failed to create table ${config.name}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🚀 Setting up DynamoDB tables (On-Demand)...\n');

  // Validate AWS configuration
  try {
    const accessKeyId = getAWSAccessKeyId();
    const secretAccessKey = getAWSSecretAccessKey();

    if (!accessKeyId || !secretAccessKey) {
      console.error(
        '❌ AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY',
      );
      process.exit(1);
    }

    console.log('✅ AWS credentials found');
    console.log(`📍 Region: ${getAWSRegion()}`);
  } catch (error) {
    console.error('❌ AWS configuration error:', error);
    process.exit(1);
  }

  // Create DynamoDB client
  const client = new DynamoDBClient({
    region: getAWSRegion(),
    credentials: {
      accessKeyId: getAWSAccessKeyId()!,
      secretAccessKey: getAWSSecretAccessKey()!,
    },
  });

  console.log('\n📋 Tables to process:');
  tables.forEach((table) => {
    console.log(
      `   - ${table.name} (${table.primaryKey}${table.sortKey ? ` + ${table.sortKey}` : ''})`,
    );
  });

  console.log('\n🏗️  Processing tables...\n');

  // Create tables sequentially to avoid throttling
  for (const table of tables) {
    try {
      await ensureTable(client, table);
      // Add delay between table creation requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to process table ${table.name}:`, error);
      process.exit(1);
    }
  }

  console.log('\n🎉 All tables processed successfully!');
}

if (import.meta.url.startsWith('file:')) {
  main().catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}
