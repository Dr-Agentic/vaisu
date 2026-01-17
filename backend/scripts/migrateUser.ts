import { DynamoDBClient, ScanCommand, UpdateItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const REGION = process.env.AWS_REGION || 'us-east-1';
const USERS_TABLE = 'vaisu-users';
const DOCUMENTS_TABLE = 'vaisu-documents';

const client = new DynamoDBClient({ 
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

async function main() {
  const email = 'morsy@vaisu.ai';
  const password = 'vaisU=0116=Rocks';
  const userId = '1'; // Explicitly requested ID

  console.log(`Creating user {email} with ID {userId}...`);

  // 1. Create User
  try {
    const passwordHash = await argon2.hash(password);
    const userItem = {
      userId,
      email,
      passwordHash,
      firstName: 'Morsy',
      lastName: 'User',
      role: 'premium',
      status: 'active',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await client.send(new PutItemCommand({
      TableName: USERS_TABLE,
      Item: marshall(userItem)
    }));
    console.log('✅ User created successfully.');
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return;
  }

  // 2. Migrate Documents
  console.log('Migrating existing documents...');
  try {
    const scanResult = await client.send(new ScanCommand({
      TableName: DOCUMENTS_TABLE
    }));

    if (!scanResult.Items || scanResult.Items.length === 0) {
      console.log('No documents found to migrate.');
      return;
    }

    console.log(`Found {scanResult.Items.length} documents. Updating owner...`);

    for (const item of scanResult.Items) {
      // Assuming documentId is the partition key and SK is the sort key
      // We need to check the schema. Based on previous steps: PK=documentId, SK=SK
      
      // Unmarshall manually or just access via types if simple
      const documentId = item.documentId.S;
      const sk = item.SK.S;

      if (!documentId || !sk) continue;

      await client.send(new UpdateItemCommand({
        TableName: DOCUMENTS_TABLE,
        Key: {
          documentId: { S: documentId },
          SK: { S: sk }
        },
        UpdateExpression: 'SET userId = :uid',
        ExpressionAttributeValues: {
          ':uid': { S: userId }
        }
      }));
      console.log(`  Updated document {documentId}`);
    }
    console.log('✅ All documents migrated.');

  } catch (error) {
    console.error('❌ Error migrating documents:', error);
  }
}

main();
