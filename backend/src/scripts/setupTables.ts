#!/usr/bin/env tsx

import dotenv from 'dotenv';
dotenv.config();

import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';

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
];

async function createTable(client: DynamoDBClient, config: TableConfig) {
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
    const result = await client.send(command);
    console.log(`✅ Table created: ${config.name}`);
    return result;
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Table already exists: ${config.name}`);
      return null;
    } else {
      console.error(`❌ Failed to create table ${config.name}:`, error);
      throw error;
    }
  }
}

async function main() {
  console.log('🚀 Setting up DynamoDB tables...\n');

  // Validate AWS configuration
  try {
    const accessKeyId = getAWSAccessKeyId();
    const secretAccessKey = getAWSSecretAccessKey();

    if (!accessKeyId || !secretAccessKey) {
      console.error('❌ AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
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

  console.log('\n📋 Tables to create:');
  tables.forEach(table => {
    console.log(`   - ${table.name} (${table.primaryKey}${table.sortKey ? ` + ${table.sortKey}` : ''})`);
  });

  console.log('\n🏗️  Creating tables...\n');

  // Create tables sequentially to avoid throttling
  for (const table of tables) {
    try {
      await createTable(client, table);
      // Add delay between table creation requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to create table ${table.name}:`, error);
      process.exit(1);
    }
  }

  console.log('\n🎉 All tables created successfully!');
  console.log('\n💡 Table structure summary:');
  console.log('   • Documents: id (PK)');
  console.log('   • Analyses: id (PK)');
  console.log('   • Visualizations: documentId (PK) + type (SK)');
  console.log('   • Knowledge Graph: documentId (PK) + type (SK)');
}

if (import.meta.url.startsWith('file:')) {
  main().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}
