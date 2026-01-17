# Backend Server Architecture

**Date:** January 16, 2026
**Status:** Updated for User Management

## 1. Overview

The Vaisu backend is a **Node.js** application built with **Express.js** and **TypeScript**. It follows a **hybrid layered architecture** with a focus on LLM integration, AWS services, and visualization generation.

The system has been upgraded to include a comprehensive **User Management System**, transforming it from a single-user proof-of-concept to a secure, multi-tenant platform.

## 2. Architectural Pattern

The application adheres to a modified layered architecture:

- **Presentation Layer**: Express routers split by domain (auth.ts, documents.ts)
- **Security Layer**: JWT-based authentication middleware and role-based access control
- **Business Logic Layer**: Services for Auth, Document Parsing, and Visualization Generation
- **Data Access Layer**: Repository pattern with 14 specialized DynamoDB tables
- **Shared Domain**: TypeScript interfaces in shared/src/types.ts

### High-Level Diagram

mermaid
graph TD
    Client[Frontend Client] -->|HTTP/REST| Server[Express Server]
    
    subgraph Backend
        Server --> AuthMW[Auth Middleware]
        AuthMW --> Router[Main Router]
        
        Router --> AuthRoute[Auth Routes]
        Router --> DocRoute[Document Routes]
        
        AuthRoute --> AuthService[Auth Service]
        DocRoute --> Parser[Document Parser]
        DocRoute --> Analyzer[Text Analyzer]
        DocRoute --> VizGen[Visualization Generator]
        
        AuthService --> UserRepo[User Repository]
        AuthService --> SessionRepo[Session Repository]
        
        Parser --> DocRepo[Document Repository]
        Analyzer --> AnalysisRepo[Analysis Repository]
        VizGen --> VizService[Visualization Service]
        
        UserRepo --> DynamoDB[(AWS DynamoDB)]
        SessionRepo --> DynamoDB
        DocRepo --> DynamoDB
        AnalysisRepo --> DynamoDB
        VizGen --> S3[(AWS S3)]
    end


## 3. Directory Structure (Updated)

The backend/src directory structure now includes User Management components:


backend/src/
├── server.ts                    # Entry point
├── routes/
│   ├── auth.ts                  # NEW: Authentication routes
│   └── documents.ts             # Document & Visualization routes
├── middleware/
│   └── auth.ts                  # NEW: JWT verification & User Context
├── services/
│   ├── auth/
│   │   └── authService.ts       # NEW: Login, Register, Token logic
│   ├── documentParser.ts
│   ├── analysis/
│   │   └── textAnalyzer.ts
│   ├── visualization/
│   │   └── visualizationGenerator.ts
│   └── storage/
│       └── s3Storage.ts
├── repositories/
│   ├── userRepository.ts        # NEW: User management
│   ├── sessionRepository.ts     # NEW: Session management
│   ├── usageLimitsRepository.ts # NEW: Quota tracking
│   ├── auditLogsRepository.ts   # NEW: Security logging
│   ├── analysisRepository.ts
│   ├── knowledgeGraphRepository.ts
│   ├── visualizationService.ts
│   └── ... (other viz repos)
├── config/
│   ├── aws.ts
│   └── modelConfig.ts
└── scripts/
    ├── setupTables.ts
    └── setupUserManagementTables.ts # NEW: User table setup


## 4. Core Components & Data Flow

### 4.1. Authentication Flow (New)

**Login Process:**
1. Client sends credentials to POST /api/auth/login
2. AuthService verifies email and password (Argon2id)
3. On success, generates Access Token (JWT) and Refresh Token
4. Stores Refresh Token hash in vaisu-sessions table
5. Returns tokens to client

**Protected Request Flow:**
1. Request hits authMiddleware
2. Middleware verifies JWT signature and expiry
3. Decodes userId and attaches to req.user
4. Route handler uses req.user.id to filter database queries

### 4.2. Document Upload & Analysis Pipeline

**Updated for Multi-tenancy:**
1. **Upload**: File stored in S3 at users/{userId}/{contentHash}/{filename}
2. **Deduplication**: Checks for existing document *owned by this user*
3. **Analysis**: LLM processing remains same, but results linked to userId
4. **Storage**: Metadata stored in DynamoDB with userId attribute

### 4.3. Visualization Generation

- **Access Control**: Checks if user owns the parent document before generating
- **Quota Check**: Verifies user has sufficient credits in vaisu-usage-limits

## 5. Security Architecture

### 5.1. Authentication
- **Algorithm**: RS256 (Asymmetric) for JWT signing
- **Password Hashing**: Argon2id
- **Session Management**: Refresh token rotation, server-side revocation

### 5.2. Data Isolation
- **Logical Isolation**: All DynamoDB queries include userId filter
- **Physical Isolation**: S3 objects prefixed with User ID

### 5.3. Infrastructure Security
- **Billing**: All DynamoDB tables use **On-Demand (PAY_PER_REQUEST)** mode to prevent over-provisioning attacks and manage costs.
- **Secrets**: Managed via environment variables (no hardcoded keys)

## 6. Storage Layer (Updated)

### 6.1. DynamoDB Tables (14 Total)

**User Management:**
1. vaisu-users: Accounts
2. vaisu-sessions: Active sessions
3. vaisu-usage-limits: Quotas
4. vaisu-audit-logs: Security logs

**Core Data:**
5. vaisu-documents
6. vaisu-analyses

**Visualizations:**
7-14. Specialized visualization tables

### 6.2. S3 Storage
- **Bucket**: vaisu-documents-dev
- **Structure**: User-partitioned paths

## 7. Scalability & Performance

- **Stateless Auth**: JWT allows horizontal scaling of API servers
- **Database**: DynamoDB On-Demand handles traffic spikes
- **Caching**: In-memory caching still present (consider Redis for distributed session cache in future)

## 8. Conclusion

The architecture has evolved from a single-user prototype to a **secure, multi-tenant platform**. The addition of the User Management layer provides the necessary foundation for production deployment, enabling secure data isolation and user-specific features while maintaining the powerful document analysis capabilities.
