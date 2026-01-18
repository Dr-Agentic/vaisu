#!/usr/bin/env tsx

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTableCommand,
} from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

import { DYNAMODB_KNOWLEDGE_GRAPH_TABLE, getAWSRegion, getAWSAccessKeyId, getAWSSecretAccessKey } from '../src/config/aws.js';

async function ensureKnowledgeGraphTable() {
  console.log(`📦 Checking table: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);

  const client = new DynamoDBClient({
    region: getAWSRegion(),
    credentials: {
      accessKeyId: getAWSAccessKeyId()!,
      secretAccessKey: getAWSSecretAccessKey()!,
    },
  });

  try {
    const describeCommand = new DescribeTableCommand({ TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE });
    const { Table } = await client.send(describeCommand);

    if (Table) {
      const currentBillingMode = Table.BillingModeSummary?.BillingMode || 'PROVISIONED';

      if (currentBillingMode !== 'PAY_PER_REQUEST') {
        console.log(`  ⚠️ Table exists but is ${currentBillingMode}. Updating to PAY_PER_REQUEST...`);
        const updateCommand = new UpdateTableCommand({
          TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
          BillingMode: 'PAY_PER_REQUEST',
        });
        await client.send(updateCommand);
        console.log(`  ✅ Table updated to PAY_PER_REQUEST: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);
      } else {
        console.log(`  ✅ Table already exists and is PAY_PER_REQUEST: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);
      }
      return;
    }
  } catch (error: any) {
    if (error.name !== 'ResourceNotFoundException') {
      console.error(`❌ Error checking table ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}:`, error);
      throw error;
    }
  }

  console.log(`🏗️  Creating table: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);

  const command = new CreateTableCommand({
    TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    KeySchema: [
      {
        AttributeName: 'documentId',
        KeyType: 'HASH',  // Partition key
      },
      {
        AttributeName: 'SK',
        KeyType: 'RANGE', // Sort key
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'documentId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'SK',
        AttributeType: 'S',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  });

  try {
    await client.send(command);
    console.log(`✅ Table created: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);
  } catch (error: any) {
    console.error(`❌ Failed to create table ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}:`, error);
    throw error;
  }
}

if (import.meta.url.startsWith('file:')) {
  ensureKnowledgeGraphTable().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}
