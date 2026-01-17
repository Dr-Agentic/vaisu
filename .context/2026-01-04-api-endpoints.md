# API Endpoints - Vaisu Backend

**Date:** January 16, 2026
**Status:** Updated for User Management

This document lists all supported API endpoints for the Vaisu backend server. All endpoints are prefixed with /api.

## Authentication & User Management (New)

### User Registration
**Method:** POST
**Endpoint:** /api/auth/register
**Description:** Register a new user account

**Request Body:**
json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}


**Response:**
json
{
  "message": "Registration successful. Please verify your email.",
  "userId": "uuid"
}


---

### User Login
**Method:** POST
**Endpoint:** /api/auth/login
**Description:** Authenticate user and receive tokens

**Request Body:**
json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}


**Response:**
json
{
  "accessToken": "jwt_token_string",
  "refreshToken": "refresh_token_string",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "free"
  }
}


---

### Refresh Token
**Method:** POST
**Endpoint:** /api/auth/refresh
**Description:** Get new access token using refresh token

**Request Body:**
json
{
  "refreshToken": "refresh_token_string"
}


---

### Get Current User
**Method:** GET
**Endpoint:** /api/auth/me
**Description:** Get profile of currently logged-in user
**Headers:** Authorization: Bearer <token>

---

### Update Profile
**Method:** PUT
**Endpoint:** /api/users/profile
**Description:** Update user profile information
**Headers:** Authorization: Bearer <token>

---

## Document Management

**Note:** All Document endpoints now require Authorization: Bearer <token> header.

### Upload & Analyze Document
**Method:** POST
**Endpoint:** /api/documents/analyze
**Description:** Upload a document (file or text) and run full AI analysis pipeline

**Request Body:**
- **File upload:** multipart/form-data with file field (PDF, TXT, MD)
- **Text input:** JSON with text field

**Response:**
json
{
  "documentId": "uuid",
  "document": { /* Document object */ },
  "analysis": { /* DocumentAnalysis object */ },
  "processingTime": 15000,
  "cached": false
}


**Flow:** Upload → Parse → Deduplicate (User-scoped) → Analyze (LLM) → Store (S3 + DynamoDB)

---

### Upload Document Only
**Method:** POST
**Endpoint:** /api/documents/upload
**Description:** Upload a document and parse it (no analysis)

**Request Body:** multipart/form-data with file field

**Response:**
json
{
  "documentId": "uuid",
  "message": "Document uploaded successfully",
  "document": { /* Document object */ }
}


---

### Get Document
**Method:** GET
**Endpoint:** /api/documents/:id
**Description:** Retrieve document from in-memory cache

---

### Get Full Document
**Method:** GET
**Endpoint:** /api/documents/:id/full
**Description:** Retrieve document from DynamoDB/S3 with reconstruction

**Flow:**
1. Check DynamoDB for document metadata (User filtered)
2. Download content from S3 (User path)
3. Reconstruct Document object with proper structure
4. Return with analysis

---

### List Documents
**Method:** GET
**Endpoint:** /api/documents
**Description:** List all documents for the current user (paginated)

**Query Parameters:**
- limit (optional, default: 50)
- offset (optional, default: 0)

**Response:**
json
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


---

### Get Analysis Progress
**Method:** GET
**Endpoint:** /api/documents/:id/progress
**Description:** Get live analysis progress (memory-only)

---

## Visualization Management

**Note:** All Visualization endpoints require Authorization: Bearer <token> header.

### Generate Visualization
**Method:** POST
**Endpoint:** /api/documents/:id/visualizations/:type
**Description:** Generate and store a visualization

**Path Parameters:**
- id: Document UUID
- type: Visualization type (see table below)

**Visualization Types:**
| Type | Description | Stored In |
|------|-------------|-----------|
| structured-view | Document outline with sections | Analyses table |
| mind-map | Hierarchical concept visualization | Mind Map table |
| flowchart | Process flow diagrams | Flowchart table |
| knowledge-graph | Entity relationships | Knowledge Graph table |
| executive-dashboard | KPIs and metrics | Executive Dashboard table |
| timeline | Chronological events | Timeline table |
| terms-definitions | Glossary of terms | Analyses table |
| uml-class-diagram | UML class diagram | UML Class table |
| argument-map | Argument structure | Argument Map table |
| depth-graph | Depth analysis | Depth Graph table |
| gantt | Gantt chart | Analyses table |
| comparison-matrix | Comparison matrix | Analyses table |
| priority-matrix | Priority matrix | Analyses table |
| raci-matrix | RACI matrix | Analyses table |
| uml-sequence | UML sequence diagram | UML Class table* |
| uml-activity | UML activity diagram | UML Class table* |

*Uses same repository as uml-class-diagram

### ⚠️ IMPORTANT: Accessing Graph Data
The API returns a wrapped response object. The actual visualization data is nested within the data property.

**Response Structure:**
json
{
  "type": "knowledge-graph",
  "data": {
    // THIS IS THE ACTUAL PAYLOAD NEEDED BY UI COMPONENTS
    "nodes": [...],
    "edges": [...],
    "clusters": [...],
    "hierarchy": { ... }
  },
  "cached": false
}


---

### Get Visualization
**Method:** GET
**Endpoint:** /api/documents/:id/visualizations/:type
**Description:** Retrieve existing visualization from DynamoDB

---

### Get All Visualizations
**Method:** GET
**Endpoint:** /api/documents/:id/visualizations
**Description:** Retrieve all visualizations for a document

---

## Utility Endpoints

### Search Documents (NOT IMPLEMENTED ❌)
**Method:** GET
**Endpoint:** /api/documents/search?q=<query>
**Status:** Documented but not implemented in code

---

### Health Check (NOT IMPLEMENTED ❌)
**Method:** GET
**Endpoint:** /api/health
**Status:** Documented but not implemented in code

---

## Error Responses

**Standard Error Format:**
json
{
  "error": "Error message describing the failure"
}


**Common Error Scenarios:**
- 401: Unauthorized (Missing or invalid token)
- 403: Forbidden (Accessing other user's data)
- 404: Document not found
- 400: No file or text provided, invalid file type
- 413: File too large (>1GB)
- 500: LLM API failure, storage error, parsing error

---

## Endpoint Summary

**Total Implemented:** 13 endpoints
**Total Documented (but not implemented):** 2 endpoints

### Implemented Endpoints:
1. ✅ POST /api/auth/register - Register
2. ✅ POST /api/auth/login - Login
3. ✅ POST /api/auth/refresh - Refresh Token
4. ✅ GET /api/auth/me - Get Current User
5. ✅ POST /api/documents/analyze - Main pipeline
6. ✅ POST /api/documents/upload - Upload only
7. ✅ GET /api/documents/:id - Get from memory
8. ✅ GET /api/documents/:id/full - Get from DynamoDB/S3
9. ✅ GET /api/documents - List all
10. ✅ GET /api/documents/:id/progress - Get progress
11. ✅ POST /api/documents/:id/visualizations/:type - Generate
12. ✅ GET /api/documents/:id/visualizations/:type - Get single
13. ✅ GET /api/documents/:id/visualizations - Get all

### Missing (But Documented):
1. ❌ GET /api/documents/search - Search functionality
2. ❌ GET /api/health - Health check

---

## Key Implementation Details

### 1. Authentication Middleware
All protected routes use authMiddleware which:
- Verifies JWT token from Authorization header
- Decodes user ID and role
- Attaches user info to req.user
- Rejects invalid requests with 401

### 2. User Isolation
- **Database**: All queries filter by userId from the token.
- **Storage**: S3 paths are prefixed with users/{userId}/.

### 3. CORS Configuration
All routes include CORS middleware:
typescript
res.header('Access-Control-Allow-Origin', '*');
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');


### 4. In-Memory State
- Documents stored in Map<string, Document>
- Analyses stored in Map<string, DocumentAnalysis>
- Progress stored in Map<string, ProgressInfo>
- **State is lost on server restart**

### 5. No Request Validation
No schema validation middleware - validation done inline in route handlers.

---

## Status Summary

**Current API is functional and supports User Management:**
- ✅ All core features work
- ✅ Authentication & User Management added
- ✅ Data isolation implemented
- ❌ Missing search and health check
- ❌ No rate limiting
- ❌ No request validation
- ❌ No structured logging
- ⚠️ Single monolithic route file for documents
