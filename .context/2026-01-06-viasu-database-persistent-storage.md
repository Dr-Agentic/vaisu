# Vaisu Database & Persistent Storage Model Analysis

**Date:** January 16, 2026
**Status:** Updated for User Management

## Overview

Vaisu implements a dual-storage architecture combining AWS S3 for document storage and AWS DynamoDB for metadata, user management, and analysis results. The system uses a hybrid approach with in-memory caching for session performance and DynamoDB for persistent storage.

## Storage Architecture

### Primary Storage Components

1. **AWS S3 (Simple Storage Service)**
   - **Purpose**: Persistent storage of original document content
   - **Bucket**: vaisu-documents-dev (configurable via S3_BUCKET_NAME env)
   - **Key Structure**: users/{userId}/{contentHash}/{filename} (User-isolated)
   - **Content Types**: Text (.txt), PDF (.pdf), Markdown (.md)
   - **Size Limit**: Varies by user role (Free: 10MB, Premium: 1GB)

2. **AWS DynamoDB (NoSQL Database)**
   - **Purpose**: Metadata, analysis results, visualization data, and user accounts
   - **Tables**: 14 specialized tables
   - **Billing Mode**: **PAY_PER_REQUEST (On-Demand)** for all tables
   - **Design Pattern**: Document-centric partitioning with User ID filtering

## Database Schema Analysis

### User Management Tables (New)

#### 1. Users Table (vaisu-users)
**Primary Key**: userId (Partition Key)
**Purpose**: User account information and authentication data

**Key Fields:**
- userId: UUID string
- email: User email (Unique)
- passwordHash: Argon2id hash
- role: 'free', 'premium', or 'enterprise'
- status: 'active', 'pending_verification', 'suspended'
- emailVerified: Boolean

**Global Secondary Indexes (GSI):**
- **GSI1**: email (PK) - For login lookups
- **GSI2**: status (PK) + createdAt (SK) - For admin filtering

#### 2. Sessions Table (vaisu-sessions)
**Primary Key**: sessionId (Partition Key)
**Purpose**: Active user sessions and refresh tokens

**Key Fields:**
- sessionId: UUID string
- userId: Foreign key to users
- refreshToken: Secure token string
- expiresAt: Timestamp
- ipAddress: Client IP
- userAgent: Client device info

**Global Secondary Indexes (GSI):**
- **GSI1**: userId (PK) + createdAt (SK) - For listing user sessions

#### 3. Usage Limits Table (vaisu-usage-limits)
**Primary Key**: userId (Partition Key) + period (Sort Key)
**Purpose**: Tracking user quotas and usage

**Key Fields:**
- userId: UUID string
- period: 'monthly' or 'daily'
- documentCount: Number of documents processed
- storageUsed: Total bytes stored
- analysisCredits: Credits consumed

#### 4. Audit Logs Table (vaisu-audit-logs)
**Primary Key**: logId (Partition Key)
**Purpose**: Security and compliance logging

**Key Fields:**
- logId: UUID string
- userId: Actor ID
- action: Event type (e.g., 'LOGIN', 'DELETE_DOCUMENT')
- timestamp: Event time
- details: JSON object with event metadata

---

### Core Document Tables

#### 5. Documents Table (vaisu-documents)
**Primary Key**: documentId (Partition Key) + SK (Sort Key, usually 'METADATA')
**Purpose**: Document metadata and S3 reference information

**Key Fields:**
- documentId: UUID string
- userId: **Owner ID (Required)**
- contentHash: SHA-256 hash
- s3Key: Path in S3

**Global Secondary Indexes (GSI):**
- **GSI1**: contentHash (PK) + filename (SK) - Deduplication (scoped to user in logic)

#### 6. Analyses Table (vaisu-analyses)
**Primary Key**: documentId (Partition Key) + SK (Sort Key, usually 'ANALYSIS')
**Purpose**: LLM analysis results

#### 7. Visualization Tables (9 specialized tables)
**Tables**: vaisu-argument-map, vaisu-depth-graph, vaisu-uml-class, vaisu-mind-map, vaisu-flowchart, vaisu-executive-dashboard, vaisu-timeline, vaisu-knowledge-graph, vaisu-terms-definitions

**Common Structure:**
- **Primary Key**: documentId (PK) + SK (Sort Key)
- **Billing Mode**: PAY_PER_REQUEST

## Storage Operations Analysis

### User Isolation Strategy

1. **Database Level**:
   - All document and analysis queries **MUST** include userId filter.
   - Users can only access records where userId matches their token.

2. **Storage Level (S3)**:
   - Objects are stored in users/{userId}/... prefixes.
   - Backend validates ownership before generating signed URLs or streaming content.

### Billing & Capacity

- **On-Demand Mode**: All tables use PAY_PER_REQUEST to minimize costs during development and scale automatically.
- **Cost Optimization**: 
  - Free tier users limited to 10MB files.
  - Old analysis results can be archived (future feature).

## Environment Configuration

### Required Environment Variables
env
# S3 Configuration
S3_BUCKET_NAME=vaisu-documents-dev

# DynamoDB Table Names (14 tables)
DYNAMODB_USERS_TABLE=vaisu-users
DYNAMODB_SESSIONS_TABLE=vaisu-sessions
DYNAMODB_USAGE_LIMITS_TABLE=vaisu-usage-limits
DYNAMODB_AUDIT_LOGS_TABLE=vaisu-audit-logs
DYNAMODB_DOCUMENTS_TABLE=vaisu-documents
# ... (other tables)

# AWS Configuration
AWS_REGION=us-east-1


### Table Setup
bash
# Create all tables (including User Management)
npm run setup:all

