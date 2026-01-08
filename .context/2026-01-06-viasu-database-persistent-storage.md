# Vaisu Database & Persistent Storage Model Analysis

**Date:** January 7, 2026
**Status:** Current Implementation

## Overview

Vaisu implements a dual-storage architecture combining AWS S3 for document storage and AWS DynamoDB for metadata and analysis results. The system uses a hybrid approach with in-memory caching for session performance and DynamoDB for persistent storage.

## Storage Architecture

### Primary Storage Components

1. **AWS S3 (Simple Storage Service)**
   - **Purpose**: Persistent storage of original document content
   - **Bucket**: `vaisu-documents-dev` (configurable via `S3_BUCKET_NAME` env)
   - **Key Structure**: `{contentHash}/{filename}`
   - **Content Types**: Text (.txt), PDF (.pdf), Markdown (.md)
   - **Size Limit**: 1GB per document

2. **AWS DynamoDB (NoSQL Database)**
   - **Purpose**: Metadata, analysis results, and visualization data
   - **Tables**: 10 specialized tables
   - **Billing Mode**: PAY_PER_REQUEST (serverless)
   - **Design Pattern**: Document-centric partitioning

## Database Schema Analysis

### Core Tables Structure

#### 1. Documents Table (`vaisu-documents`)
**Primary Key**: `id` (Partition Key)
**Purpose**: Document metadata and S3 reference information

**Key Fields:**
- `id`: UUID string (document identifier)
- `userId`: User who uploaded document (currently '1' for anonymous)
- `contentHash`: SHA-256 hash for deduplication
- `filename`: Original filename
- `s3Path`, `s3Bucket`, `s3Key`: S3 storage references
- `contentType`: MIME type (text/plain, application/pdf, etc.)
- `fileSize`: Document size in bytes
- `uploadedAt`: Timestamp of upload
- `lastAccessedAt`: Last access timestamp
- `accessCount`: Access counter

**Note**: This table uses simple PK without sort key (not documentId + SK as previously documented)

#### 2. Analyses Table (`vaisu-analyses`)
**Primary Key**: `id` (Partition Key)
**Purpose**: LLM analysis results and structured document data

**Key Fields:**
- `id`: UUID string (matches document id)
- `analysisVersion`: Version identifier
- `analysis`: Complete analysis object (DocumentAnalysis type from shared/types.ts)
- `llmMetadata`: Processing information
  - `model`: LLM model used
  - `tokensUsed`: Token consumption metrics
  - `processingTime`: Duration in milliseconds
  - `timestamp`: Processing timestamp
- `createdAt`: Analysis creation timestamp

**Note**: Stores structured-view data inline with analysis

#### 3. Visualization Tables (8 specialized tables)

Each visualization type has its own table with consistent structure:

**Tables:**
- `vaisu-argument-map`
- `vaisu-depth-graph`
- `vaisu-uml-class`
- `vaisu-mind-map`
- `vaisu-flowchart`
- `vaisu-executive-dashboard`
- `vaisu-timeline`
- `vaisu-knowledge-graph`

**Common Structure:**
- **Primary Key**: `documentId` (PK) + `type` (Sort Key)
- **Fields:**
  - `documentId`: Foreign key to documents table
  - `type`: Visualization type identifier
  - `visualizationData`: Generated visualization data (JSON)
  - `llmMetadata`: Generation metadata
  - `createdAt`, `updatedAt`: Timestamps

**Aggregation Pattern**: The `visualizationService` aggregates data across these tables. **Important**: Some visualization types share repositories:
- `structured-view` → stored in `analyses` table
- `terms-definitions` → stored in `analyses` table
- `gantt`, `comparison-matrix`, `priority-matrix`, `raci-matrix` → stored in `analyses` table
- `uml-class-diagram`, `uml-sequence`, `uml-activity` → all use `uml-class` repository
- `depth-graph` → uses `depth-graph` repository

### Data Relationships

```
Documents (id) ←→ Analyses (id)
Documents (id) ←→ Visualizations (documentId)
```

One-to-one relationship between Documents and Analyses (both use same ID).
One-to-many relationship between Documents and Visualizations.

## Storage Operations Analysis

### Read Operations

#### 1. Document Retrieval Pattern
```typescript
// Step 1: Check DynamoDB for document metadata
const docRecord = await documentRepository.findById(documentId);

// Step 2: Download content from S3
const contentBuffer = await s3Storage.downloadDocument(docRecord.s3Key);

// Step 3: Reconstruct document object with proper structure
const document = await documentParser.parseDocument(
  contentBuffer,
  docRecord.filename,
  docRecord.documentId  // Preserves original ID
);
```

#### 2. Analysis Retrieval Pattern
```typescript
// Single read operation for analysis
const analysis = await analysisRepository.findByDocumentId(documentId);
```

#### 3. Visualization Retrieval Pattern (Aggregation)
```typescript
// Uses visualizationService to query multiple tables
const visualizations = await visualizationService.findByDocumentId(documentId);

// Service iterates through all known visualization types:
for (const type of types) {
  const repository = getRepositoryForType(type);
  const viz = await repository.findByDocumentId(documentId);
  if (viz) results.push(viz);
}
```

### Write Operations

#### 1. Document Storage Flow
```typescript
// Step 1: Upload to S3
const s3Result = await s3Storage.uploadDocument(contentHash, filename, buffer);

// Step 2: Create document record (in-memory cache)
const documentRecord = {
  documentId: document.id,  // Preserved from parsed document
  userId: '1',
  contentHash,
  filename,
  s3Path: s3Result.path,
  s3Bucket: s3Result.bucket,
  s3Key: s3Result.key,
  contentType: document.metadata.fileType,
  fileSize: buffer.length,
  uploadedAt: new Date().toISOString(),
  lastAccessedAt: new Date().toISOString(),
  accessCount: 1,
};

await documentRepository.create(documentRecord);
```

#### 2. Analysis Storage Pattern
```typescript
const analysisRecord = {
  id: document.id,  // Same as document ID
  analysisVersion: 'v1.0',
  analysis: analysisResult,
  llmMetadata: {
    model: 'x-ai/grok-4.1-fast',
    tokensUsed: 0,  // Tracked in implementation
    processingTime,
    timestamp: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
};

await analysisRepository.create(analysisRecord);
```

#### 3. Visualization Storage Pattern
```typescript
const visualizationRecord = {
  documentId: document.id,
  type: 'knowledge-graph',  // Sort key
  visualizationData: generatedData,
  llmMetadata: {
    model: 'x-ai/grok-4.1-fast',
    tokensUsed: 0,
    processingTime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

await visualizationService.create(visualizationRecord);
// Routes to knowledgeGraphRepository.create()
```

## Deduplication Strategy

### Content-Based Deduplication
1. **Hash Calculation**: SHA-256 of document content
2. **Filename Tracking**: Combined with hash for uniqueness
3. **Lookup Pattern**: `contentHash` + `filename` GSI query
4. **Cache Hit**: Return existing document ID if found
5. **Cache Miss**: Process and store new document

```typescript
// In analyze route
const contentHash = calculateContentHash(buffer.toString('utf-8'));
const cachedDoc = await documentRepository.findByHashAndFilename(contentHash, filename);

if (cachedDoc) {
  // Return existing document
  return {
    documentId: cachedDoc.documentId,
    document,
    analysis: cachedAnalysis.analysis,
    cached: true,
  };
}
```

**Important**: The `findByHashAndFilename` is a GSI (Global Secondary Index) query on the documents table.

## Repository Implementation Pattern

### Single-File Repositories
Each visualization type has its own repository file with 4 functions:

```typescript
// Example: knowledgeGraphRepository.ts
export async function create(visualization: VisualizationRecord): Promise<void>
export async function findByDocumentId(documentId: string): Promise<VisualizationRecord | null>
export async function update(documentId: string, updates: Partial<VisualizationRecord>): Promise<void>
export async function deleteKnowledgeGraph(documentId: string): Promise<void>
```

### VisualizationService Aggregation
The `VisualizationService` class acts as a router:

```typescript
export class VisualizationService {
  async create(visualization: VisualizationRecord): Promise<void> {
    const repository = this.getRepositoryForType(visualization.visualizationType);
    await repository.create(visualization);
  }

  async findByDocumentIdAndType(documentId: string, type: string): Promise<VisualizationRecord | null> {
    const repository = this.getRepositoryForType(type);
    return await repository.findByDocumentId(documentId);
  }

  async findByDocumentId(documentId: string): Promise<VisualizationRecord[]> {
    // Query all tables and aggregate results
    const types = ['structured-view', 'argument-map', 'depth-graph', ...];
    const results = [];
    for (const type of types) {
      try {
        const repository = this.getRepositoryForType(type);
        const visualization = await repository.findByDocumentId(documentId);
        if (visualization) results.push(visualization);
      } catch (error) {
        // Continue if one type fails
      }
    }
    return results;
  }

  private getRepositoryForType(type: string): any {
    switch (type) {
      case 'structured-view':
      case 'terms-definitions':
      case 'gantt':
      case 'comparison-matrix':
      case 'priority-matrix':
      case 'raci-matrix':
        return analysisRepository;  // SHARED REPOSITORY
      case 'knowledge-graph':
        return knowledgeGraphRepository;
      case 'argument-map':
        return argumentMapRepository;
      case 'depth-graph':
        return depthGraphRepository;
      case 'uml-class':
      case 'uml-class-diagram':
      case 'uml-sequence':
      case 'uml-activity':
        return umlClassRepository;  // SHARED REPOSITORY
      case 'mind-map':
        return mindMapRepository;
      case 'flowchart':
        return flowchartRepository;
      case 'executive-dashboard':
        return executiveDashboardRepository;
      case 'timeline':
        return timelineRepository;
      default:
        throw new Error(`Unknown visualization type: ${type}`);
    }
  }
}
```

## Performance Optimizations

### 1. In-Memory Caching (Stateful)
**Location**: Backend route handlers (`documents.ts`)
- **Documents Map**: `new Map<string, Document>()`
- **Analyses Map**: `new Map<string, DocumentAnalysis>()`
- **Progress Store**: `new Map<string, ProgressInfo>()`

**Limitation**: Server becomes stateful. On restart, session data is lost.

### 2. Database Optimizations
- **Pay-per-Request**: DynamoDB scales automatically
- **Composite Keys**: Efficient partition queries
- **Connection Reuse**: Singleton DynamoDB clients in `config/aws.ts`
- **Batch Operations**: Not currently implemented

### 3. S3 Optimizations
- **Streaming**: Memory-efficient uploads
- **Content Hashing**: Deduplication reduces storage costs
- **No Presigned URLs**: Direct backend access (simpler, less secure)

## Error Handling & Resilience

### 1. Storage Failures (Graceful Degradation)
```typescript
try {
  await s3Storage.uploadDocument(hash, filename, buffer);
  await documentRepository.create(documentRecord);
  await analysisRepository.create(analysisRecord);
} catch (storageError) {
  console.error('Storage error:', storageError);
  // Continue anyway - return analysis result
}
```

### 2. Cache Failures
```typescript
try {
  const cachedDoc = await documentRepository.findByHashAndFilename(contentHash, filename);
  if (cachedDoc) { /* ... */ }
} catch (cacheError) {
  console.error('Cache lookup error (continuing with analysis):', cacheError);
  // Continue with new analysis
}
```

### 3. Visualization Generation Failures
```typescript
// visualizationGenerator.ts - LLM failures throw errors
// No fallback for most visualizations - fail fast
throw new Error('Unable to generate mind map visualization...');
```

## Environment Configuration

### Required Environment Variables
```env
# S3 Configuration
S3_BUCKET_NAME=vaisu-documents-dev

# DynamoDB Table Names (10 tables)
DYNAMODB_DOCUMENTS_TABLE=vaisu-documents
DYNAMODB_ANALYSES_TABLE=vaisu-analyses
DYNAMODB_ARGUMENT_MAP_TABLE=vaisu-argument-map
DYNAMODB_DEPTH_GRAPH_TABLE=vaisu-depth-graph
DYNAMODB_UML_CLASS_TABLE=vaisu-uml-class
DYNAMODB_MIND_MAP_TABLE=vaisu-mind-map
DYNAMODB_FLOWCHART_TABLE=vaisu-flowchart
DYNAMODB_EXECUTIVE_DASHBOARD_TABLE=vaisu-executive-dashboard
DYNAMODB_TIMELINE_TABLE=vaisu-timeline
DYNAMODB_KNOWLEDGE_GRAPH_TABLE=vaisu-knowledge-graph

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Application
PORT=3001
OPENROUTER_API_KEY=your_openrouter_key
```

### Table Setup
```bash
# Create all tables
cd backend
npm run setup  # or: npx tsx src/scripts/setupTables.ts
```

## API Integration Points

### 1. Document Upload/Analyze
- **Endpoint**: `POST /api/documents/analyze`
- **Flow**: Upload → Parse → Dedupe → Analyze → Store (S3 + DynamoDB)
- **Returns**: Document + Analysis with progress updates

### 2. Visualization Generation
- **Endpoint**: `POST /api/documents/:id/visualizations/:type`
- **Flow**: Check DynamoDB → Generate → Store → Return
- **Cache**: Checks existing visualizations before generating new ones

### 3. Data Retrieval
- **Endpoint**: `GET /api/documents/:id/full`
- **Flow**: DynamoDB → S3 → Reconstruct → Return
- **Fallback**: In-memory → DynamoDB/S3

### 4. Health Check
- **Endpoint**: `GET /api/health` (NOT IMPLEMENTED - missing)

## Current Limitations

### 1. Storage
- **No TTL**: Documents never expire automatically
- **No Backup Strategy**: Manual backup required
- **No Archival**: All data remains hot
- **No Presigned URLs**: All downloads go through backend

### 2. Caching
- **Memory-Only**: No Redis or external cache
- **Session-Lost on Restart**: Server stateful
- **No Cache Invalidation**: Old data persists

### 3. Repository Design
- **Mixed Responsibilities**: AnalysisRepository handles multiple visualization types
- **Inconsistent**: Some types use separate repos, others share
- **No Bulk Operations**: Single queries only

### 4. Security
- **Anonymous Access**: User ID always '1'
- **No Authentication**: Open access
- **S3 Access**: Direct backend access (no presigned URLs)

## Architecture Summary

### File Structure Reality
```
backend/src/
├── config/
│   ├── aws.ts              # DynamoDB + S3 clients
│   └── modelConfig.ts      # LLM model configs
├── repositories/
│   ├── analysisRepository.ts       # Handles 6 visualization types
│   ├── knowledgeGraphRepository.ts
│   ├── argumentMapRepository.ts
│   ├── umlClassRepository.ts       # Handles 3 UML types
│   ├── mindMapRepository.ts
│   ├── flowchartRepository.ts
│   ├── executiveDashboardRepository.ts
│   ├── timelineRepository.ts
│   ├── depthGraphRepository.ts
│   ├── types.ts                    # TypeScript interfaces
│   └── visualizationService.ts     # Router/Aggregator
├── routes/
│   └── documents.ts         # Single monolithic route file
├── services/
│   ├── documentParser.ts
│   ├── analysis/
│   │   └── textAnalyzer.ts  # ONLY analysis service
│   ├── visualization/
│   │   └── visualizationGenerator.ts  # ONE class, many methods
│   └── storage/
│       └── s3Storage.ts
├── utils/
│   └── hash.ts
└── server.ts                # Express entry point
```

### Key Implementation Details
1. **10 DynamoDB tables** as documented
2. **In-memory caching** for performance (not in docs)
3. **Shared repositories** for multiple types (not in docs)
4. **Single analysis service** (not in docs)
5. **Aggregator pattern** for visualizations (not in docs)
6. **Stateful server** due to memory maps (not in docs)

## Conclusion

The storage architecture is **functional but has limitations**:
- ✅ Dual-storage (S3 + DynamoDB) works correctly
- ✅ 10 specialized tables exist
- ✅ Deduplication strategy implemented
- ✅ Aggregation service handles multiple types

- ❌ Server is stateful (memory-only caching)
- ❌ No TTL or cleanup mechanisms
- ❌ Repository responsibilities are mixed
- ❌ No authentication/authorization

**Recommendations**:
1. Add Redis for shared caching
2. Implement TTL on DynamoDB tables
3. Refactor repository pattern for consistency
4. Add authentication layer
5. Implement presigned S3 URLs for security
