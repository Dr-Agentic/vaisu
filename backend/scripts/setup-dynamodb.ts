#!/usr/bin/env tsx

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTableCommand,
} from '@aws-sdk/client-dynamodb';
import 'dotenv/config';

// Environment variables
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Table definitions
const TABLES = [
  {
    name: process.env.DYNAMODB_DOCUMENTS_TABLE || 'vaisu-documents',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'contentHash', AttributeType: 'S' },
      { AttributeName: 'filename', AttributeType: 'S' },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'contentHash', KeyType: 'HASH' },
          { AttributeName: 'filename', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: process.env.DYNAMODB_ANALYSES_TABLE || 'vaisu-analyses',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  // Visualization tables (one per representation model)
  {
    name: process.env.DYNAMODB_ARGUMENT_MAP_TABLE || 'vaisu-argument-map',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: process.env.DYNAMODB_DEPTH_GRAPH_TABLE || 'vaisu-depth-graph',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: process.env.DYNAMODB_UML_CLASS_TABLE || 'vaisu-uml-class',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: process.env.DYNAMODB_MIND_MAP_TABLE || 'vaisu-mind-map',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: process.env.DYNAMODB_FLOWCHART_TABLE || 'vaisu-flowchart',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name:
      process.env.DYNAMODB_EXECUTIVE_DASHBOARD_TABLE
      || 'vaisu-executive-dashboard',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: process.env.DYNAMODB_TIMELINE_TABLE || 'vaisu-timeline',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: process.env.DYNAMODB_KNOWLEDGE_GRAPH_TABLE || 'vaisu-knowledge-graph',
    keySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name: process.env.DYNAMODB_ENTITY_GRAPH_TABLE || 'vaisu-entity-graph',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
  {
    name:
      process.env.DYNAMODB_STRUCTURED_VIEW_TABLE || 'vaisu-structured-views',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    billingMode: 'PAY_PER_REQUEST',
  },
];

async function main() {
  console.log('🚀 Setting up DynamoDB tables for Vaisu (On-Demand)...\n');

  // Validate AWS credentials
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not configured');
    console.error(
      'Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables',
    );
    process.exit(1);
  }

  const client = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  console.log(`📍 Region: ${AWS_REGION}`);
  console.log(`📊 Processing ${TABLES.length} tables...\n`);

  for (const tableConfig of TABLES) {
    try {
      console.log(`📦 Checking table: ${tableConfig.name}...`);

      // Check if table exists
      try {
        const describeCommand = new DescribeTableCommand({
          TableName: tableConfig.name,
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
              TableName: tableConfig.name,
              BillingMode: 'PAY_PER_REQUEST',
            });
            await client.send(updateCommand);
            console.log(
              `  ✅ Table updated to PAY_PER_REQUEST: ${tableConfig.name}`,
            );
          } else {
            console.log(
              `  ✅ Table already exists and is PAY_PER_REQUEST: ${tableConfig.name}`,
            );
          }
          continue;
        }
      } catch (error: any) {
        if (error.name !== 'ResourceNotFoundException') {
          throw error;
        }
        // Table doesn't exist, proceed to create
      }

      const command = new CreateTableCommand({
        TableName: tableConfig.name,
        KeySchema: tableConfig.keySchema,
        AttributeDefinitions: tableConfig.attributeDefinitions,
        BillingMode: 'PAY_PER_REQUEST',
        GlobalSecondaryIndexes: tableConfig.globalSecondaryIndexes,
      });

      await client.send(command);
      console.log(`✅ Created table: ${tableConfig.name}`);
    } catch (error: any) {
      console.error(
        `❌ Failed to process table ${tableConfig.name}:`,
        error.message,
      );
    }
  }

  console.log('\n🎉 DynamoDB setup complete!');
}

main().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
