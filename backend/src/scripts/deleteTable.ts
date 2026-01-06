#!/usr/bin/env tsx

import dotenv from 'dotenv';
dotenv.config();

import { DynamoDBClient, DeleteTableCommand } from '@aws-sdk/client-dynamodb';

import { DYNAMODB_KNOWLEDGE_GRAPH_TABLE, getAWSRegion, getAWSAccessKeyId, getAWSSecretAccessKey } from '../config/aws.js';

async function deleteTable() {
  console.log(`🗑️  Deleting table: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);

  const client = new DynamoDBClient({
    region: getAWSRegion(),
    credentials: {
      accessKeyId: getAWSAccessKeyId()!,
      secretAccessKey: getAWSSecretAccessKey()!,
    },
  });

  try {
    const command = new DeleteTableCommand({
      TableName: DYNAMODB_KNOWLEDGE_GRAPH_TABLE,
    });

    const result = await client.send(command);
    console.log(`✅ Table deletion initiated: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);
    console.log('⚠️  Table deletion may take a few moments to complete');

    return result;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      console.log(`⚠️  Table does not exist: ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}`);
      return null;
    } else {
      console.error(`❌ Failed to delete table ${DYNAMODB_KNOWLEDGE_GRAPH_TABLE}:`, error);
      throw error;
    }
  }
}

if (import.meta.url.startsWith('file:')) {
  deleteTable().catch(error => {
    console.error('❌ Delete table failed:', error);
    process.exit(1);
  });
}
