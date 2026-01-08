# API Endpoints - Vaisu Backend

**Date:** January 7, 2026
**Status:** Current Implementation

This document lists all supported API endpoints for the Vaisu backend server. All endpoints are prefixed with `/api`.

## Document Management

### Upload & Analyze Document
**Method:** `POST`  
**Endpoint:** `/api/documents/analyze`  
**Description:** Upload a document (file or text) and run full AI analysis pipeline

**Request Body:**
- **File upload:** `multipart/form-data` with `file` field (PDF, TXT, MD)
- **Text input:** JSON with `text` field

**Response:**
```json
{
  "documentId": "uuid",
  "document": { /* Document object */ },
  "analysis": { /* DocumentAnalysis object */ },
  "processingTime": 15000,
  "cached": false
}
```

**Flow:** Upload → Parse → Deduplicate → Analyze (LLM) → Store (S3 + DynamoDB)

---

### Upload Document Only
**Method:** `POST`  
**Endpoint:** `/api/documents/upload`  
**Description:** Upload a document and parse it (no analysis)

**Request Body:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "documentId": "uuid",
  "message": "Document uploaded successfully",
  "document": { /* Document object */ }
}
```

**Note:** Document is stored in memory only, not persisted to database.

---

### Get Document
**Method:** `GET`  
**Endpoint:** `/api/documents/:id`  
**Description:** Retrieve document from in-memory cache

**Response:**
```json
{
  "document": { /* Document object */ },
  "analysis": { /* Analysis object (if exists) */ }
}
```

**Fails:** Returns 404 if document not in memory.

---

### Get Full Document
**Method:** `GET`  
**Endpoint:** `/api/documents/:id/full`  
**Description:** Retrieve document from DynamoDB/S3 with reconstruction

**Flow:**
1. Check DynamoDB for document metadata
2. Download content from S3
3. Reconstruct Document object with proper structure
4. Return with analysis

**Response:**
```json
{
  "document": { /* Document object */ },
  "analysis": { /* Analysis object */ },
  "visualizations": {} /* Empty - visualizations fetched separately */
}
```

---

### List Documents
**Method:** `GET`  
**Endpoint:** `/api/documents`  
**Description:** List all documents (paginated)

**Query Parameters:**
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "title": "filename.txt",
      "fileType": "text/plain",
      "uploadDate": "ISO timestamp",
      "tldr": { "text": "..." },
      "summaryHeadline": "...",
      "wordCount": 0
    }
  ],
  "total": 10,
  "limit": 50,
  "offset": 0
}
```

**Note:** Queries DynamoDB, not in-memory cache.

---

### Get Analysis Progress
**Method:** `GET`  
**Endpoint:** `/api/documents/:id/progress`  
**Description:** Get live analysis progress (memory-only)

**Response:**
```json
{
  "step": "executiveSummary",
  "progress": 40,
  "message": "Generating Executive Summary...",
  "partialAnalysis": { /* Partial analysis object */ }
}
```

**Note:** Progress is stored in memory and cleared when analysis completes.

---

## Visualization Management

### Generate Visualization
**Method:** `POST`  
**Endpoint:** `/api/documents/:id/visualizations/:type`  
**Description:** Generate and store a visualization

**Path Parameters:**
- `id`: Document UUID
- `type`: Visualization type (see table below)

**Visualization Types:**
| Type | Description | Stored In |
|------|-------------|-----------|
| `structured-view` | Document outline with sections | Analyses table |
| `mind-map` | Hierarchical concept visualization | Mind Map table |
| `flowchart` | Process flow diagrams | Flowchart table |
| `knowledge-graph` | Entity relationships | Knowledge Graph table |
| `executive-dashboard` | KPIs and metrics | Executive Dashboard table |
| `timeline` | Chronological events | Timeline table |
| `terms-definitions` | Glossary of terms | Analyses table |
| `uml-class-diagram` | UML class diagram | UML Class table |
| `argument-map` | Argument structure | Argument Map table |
| `depth-graph` | Depth analysis | Depth Graph table |
| `gantt` | Gantt chart | Analyses table |
| `comparison-matrix` | Comparison matrix | Analyses table |
| `priority-matrix` | Priority matrix | Analyses table |
| `raci-matrix` | RACI matrix | Analyses table |
| `uml-sequence` | UML sequence diagram | UML Class table* |
| `uml-activity` | UML activity diagram | UML Class table* |

*Uses same repository as uml-class-diagram

**Response:**
```json
{
  "type": "knowledge-graph",
  "data": {
    "nodes": [...],
    "edges": [...],
    "clusters": [...],
    "hierarchy": { ... }
  },
  "cached": false
}
```

---

### Get Visualization
**Method:** `GET`  
**Endpoint:** `/api/documents/:id/visualizations/:type`  
**Description:** Retrieve existing visualization from DynamoDB

**Response:**
```json
{
  "type": "knowledge-graph",
  "data": { /* Visualization data */ },
  "cached": true,
  "metadata": { /* LLM metadata */ }
}
```

**Returns 404:** If visualization doesn't exist (must generate first).

---

### Get All Visualizations
**Method:** `GET`  
**Endpoint:** `/api/documents/:id/visualizations`  
**Description:** Retrieve all visualizations for a document

**Response:**
```json
{
  "documentId": "uuid",
  "visualizations": {
    "structured-view": { "data": {...}, "metadata": {...} },
    "knowledge-graph": { "data": {...}, "metadata": {...} },
    ...
  },
  "count": 5
}
```

**Flow:** Queries all 10 tables via `visualizationService.findByDocumentId()`.

---

## Utility Endpoints

### Search Documents (NOT IMPLEMENTED ❌)
**Method:** `GET`  
**Endpoint:** `/api/documents/search?q=<query>`  
**Status:** Documented but not implemented in code

---

### Health Check (NOT IMPLEMENTED ❌)
**Method:** `GET`  
**Endpoint:** `/api/health`  
**Status:** Documented but not implemented in code

---

## Error Responses

**Standard Error Format:**
```json
{
  "error": "Error message describing the failure"
}
```

**Common Error Scenarios:**
- 404: Document not found
- 400: No file or text provided, invalid file type
- 413: File too large (>1GB)
- 500: LLM API failure, storage error, parsing error

---

## Endpoint Summary

**Total Implemented:** 9 endpoints  
**Total Documented (but not implemented):** 2 endpoints

### Implemented Endpoints:
1. ✅ `POST /api/documents/analyze` - Main pipeline
2. ✅ `POST /api/documents/upload` - Upload only
3. ✅ `GET /api/documents/:id` - Get from memory
4. ✅ `GET /api/documents/:id/full` - Get from DynamoDB/S3
5. ✅ `GET /api/documents` - List all
6. ✅ `GET /api/documents/:id/progress` - Get progress
7. ✅ `POST /api/documents/:id/visualizations/:type` - Generate
8. ✅ `GET /api/documents/:id/visualizations/:type` - Get single
9. ✅ `GET /api/documents/:id/visualizations` - Get all

### Missing (But Documented):
1. ❌ `GET /api/documents/search` - Search functionality
2. ❌ `GET /api/health` - Health check

---

## Key Implementation Details

### 1. All Routes in Single File
All endpoints are defined in: **`backend/src/routes/documents.ts`** (618 lines)

### 2. CORS Configuration
All routes include CORS middleware:
```typescript
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### 3. In-Memory State
- Documents stored in `Map<string, Document>`
- Analyses stored in `Map<string, DocumentAnalysis>`
- Progress stored in `Map<string, ProgressInfo>`
- **State is lost on server restart**

### 4. No Request Validation
No schema validation middleware - validation done inline in route handlers.

### 5. No Authentication
All endpoints are open. User ID defaults to '1' (anonymous).

### 6. Mixed Response Types
Some endpoints return HTTP 200 with error objects instead of proper error codes.

---

## Examples

### Full Pipeline Example
```bash
# Upload and analyze document
curl -X POST http://localhost:3001/api/documents/analyze \
  -F "file=@document.pdf"

# Response includes documentId, use it for visualizations
# documentId: 1f8ef92b-eb95-4ce3-99d4-2c4cf5ffa6bd

# Generate knowledge graph
curl -X POST http://localhost:3001/api/documents/1f8ef92b-eb95-4ce3-99d4-2c4cf5ffa6bd/visualizations/knowledge-graph

# Get all visualizations
curl -X GET http://localhost:3001/api/documents/1f8ef92b-eb95-4ce3-99d4-2c4cf5ffa6bd/visualizations
```

### Text Input Example
```bash
curl -X POST http://localhost:3001/api/documents/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Your document text here..."}'
```

---

## Notes

- **Base Path:** All endpoints prefixed with `/api`
- **Port:** Default 3001 (configurable via `PORT` env)
- **File Upload:** Uses `multer` with memory storage
- **File Types:** `.txt`, `.pdf`, `.md` only
- **Max Size:** 1GB
- **Deduplication:** Based on SHA-256 hash of content
- **Caching:** Memory → DynamoDB → S3
- **LLM:** OpenRouter API (requires API key)
- **Processing Time:** 10-30 seconds for typical documents
- **Visualizations:** 15 types supported, 10+ with actual implementations

---

## Status Summary

**Current API is functional but incomplete:**
- ✅ All core features work
- ✅ 9/11 documented endpoints implemented
- ❌ Missing search and health check
- ❌ No authentication
- ❌ No rate limiting
- ❌ No request validation
- ❌ No structured logging
- ⚠️ Single monolithic route file
