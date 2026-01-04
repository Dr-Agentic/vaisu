# Database Setup Scripts

This directory contains scripts to set up the database infrastructure for Vaisu.

## DynamoDB Setup

### Prerequisites

1. **AWS CLI installed and configured**:
   ```bash
   aws --version
   aws configure
   ```

2. **Environment variables set**:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_REGION=us-east-1
   ```

### Create Tables

Run the setup script to create all required DynamoDB tables:

```bash
# Using tsx (TypeScript execution)
tsx scripts/setup-dynamodb.ts

# Or compile and run
npm run build
node dist/scripts/setup-dynamodb.js
```

### Tables Created

The script creates the following tables:

- **vaisu-documents** - Document metadata storage
- **vaisu-analyses** - Document analysis results
- **vaisu-argument-map** - Argument map visualizations
- **vaisu-depth-graph** - Depth graph visualizations
- **vaisu-uml-class** - UML class diagram visualizations
- **vaisu-mind-map** - Mind map visualizations
- **vaisu-flowchart** - Flowchart visualizations
- **vaisu-executive-dashboard** - Executive dashboard visualizations
- **vaisu-timeline** - Timeline visualizations

### Manual AWS CLI Setup

Alternatively, you can create tables manually using AWS CLI:

```bash
aws dynamodb create-table \
  --table-name vaisu-documents \
  --attribute-definitions AttributeName=documentId,AttributeType=S AttributeName=SK,AttributeType=S \
  --key-schema AttributeName=documentId,KeyType=HASH AttributeName=SK,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Repeat for other tables...
```

### S3 Bucket Setup

Create the S3 bucket for document storage:

```bash
aws s3 mb s3://vaisu-documents-dev --region us-east-1
```

## Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your AWS credentials and configuration.