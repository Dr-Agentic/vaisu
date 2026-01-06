#!/usr/bin/env tsx

import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
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
    globalSecondaryIndexes: [{
      IndexName: 'GSI1',
      KeySchema: [
        { AttributeName: 'contentHash', KeyType: 'HASH' },
        { AttributeName: 'filename', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    }],
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
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
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
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
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
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
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
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
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
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
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
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
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
  {
    name: process.env.DYNAMODB_EXECUTIVE_DASHBOARD_TABLE || 'vaisu-executive-dashboard',
    keySchema: [
      { AttributeName: 'documentId', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    attributeDefinitions: [
      { AttributeName: 'documentId', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
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
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
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
    provisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  },
];

async function main() {
  console.log('🚀 Setting up DynamoDB tables for Vaisu...\n');

  // Validate AWS credentials
  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not configured');
    console.error('Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables');
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
  console.log(`📊 Creating ${TABLES.length} tables...\n`);

  console.log('📋 Table Schema:');
  console.log('   • vaisu-knowledge-graph: PK=GRAPH#{DocumentID}, SK=NODE#{NodeID}|EDGE#{SourceID}#{TargetID}');
  console.log('     - Stores KnowledgeNode and KnowledgeEdge entities');
  console.log('     - Attributes: confidence, entityType, metadata (sources), relationshipType');
  console.log('');

  for (const tableConfig of TABLES) {
    try {
      console.log(`📦 Creating table: ${tableConfig.name}...`);

      const command = new CreateTableCommand({
        TableName: tableConfig.name,
        KeySchema: tableConfig.keySchema,
        AttributeDefinitions: tableConfig.attributeDefinitions,
        ProvisionedThroughput: tableConfig.provisionedThroughput,
        GlobalSecondaryIndexes: tableConfig.globalSecondaryIndexes,
      });

      await client.send(command);
      console.log(`✅ Created table: ${tableConfig.name}`);
    } catch (error: any) {
      if (error.name === 'ResourceInUseException') {
        console.log(`⚠️  Table already exists: ${tableConfig.name}`);
      } else {
        console.error(`❌ Failed to create table ${tableConfig.name}:`, error.message);
      }
    }
  }

  console.log('\n🎉 DynamoDB setup complete!');
  console.log('\n📋 Tables created:');
  TABLES.forEach(table => console.log(`   • ${table.name}`));

  console.log('\n💡 Next steps:');
  console.log('   1. Configure S3 bucket: vaisu-documents-dev');
  console.log('   2. Set environment variables in .env file');
  console.log('   3. Start the backend server');
}

main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
