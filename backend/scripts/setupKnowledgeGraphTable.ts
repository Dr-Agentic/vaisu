#!/usr/bin/env tsx

import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

import { DYNAMODB_KNOWLEDGE_GRAPH_TABLE, getAWSRegion, getAWSAccessKeyId, getAWSSecretAccessKey } from '../src/config/aws.js';

async function createKnowledgeGraphTable() {
  console.log(`🏗️  Creating table: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);

  const client = new DynamoDBClient({
    region: getAWSRegion(),
    credentials: {
      accessKeyId: getAWSAccessKeyId()!,
      secretAccessKey: getAWSSecretAccessKey()!,
    },
  });

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
    const result = await client.send(command);
    console.log(`✅ Table created: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);
    return result;
  } catch (error: any) {
    if (error.name === 'ResourceInUseException') {
      console.log(`⚠️  Table already exists: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);
      return null;
    } else {
      console.error(`❌ Failed to create table ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}:`, error);
      throw error;
    }
  }
}

if (import.meta.url.startsWith('file:')) {
  createKnowledgeGraphTable().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}
