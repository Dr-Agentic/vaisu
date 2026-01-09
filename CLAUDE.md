# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**Vaisu** is a text-to-visual intelligence application that transforms text documents into interactive visual representations using AI-powered analysis. The project features a React frontend with multiple visualization types (structured view, mind map, flowchart, knowledge graph, executive dashboard, timeline) and a Node.js/Express backend with OpenRouter API integration.

## Development Guidelines

### Core Architecture Rules

#### Module Structure
- **Architecture Pattern**: Use routes/services architecture (Express routes for HTTP handling, services for business logic, repositories for data access)
- **File Naming**:
  - Routes: `*.ts` (e.g., `documents.ts`)
  - Services: `*.ts` with class-based pattern (e.g., `openRouterClient.ts`, `textAnalyzer.ts`)
  - Repositories: `*.ts` (e.g., `documentRepository.ts`)
- **Separation of Concerns**: Services may only interact with entities within their responsibility
  - Routes handle HTTP request/response
  - Services implement business logic
  - Repositories handle data access
  - No cross-layer violations (e.g., routes should not access database directly)

#### Function Design
- **Modularity**: Each function must be modular, reusable, and well-commented
- **Size Limit**: Functions should fit within ~30 lines. If longer, refactor into smaller units
- **Naming Conventions**:
  - Private methods: Prefix with `_` (e.g., `_retrieveUserFromDatabase()`)
  - Public methods: Follow standard naming conventions
- **Organization**: Place exported functions/methods at top, private functions at bottom

#### Code Quality Standards
- **Reusability**: Always reuse existing functions and modules. Avoid duplicating logic
- **Production Quality**: Avoid hacks and quick fixes. Implement clean, idiomatic code
- **Backend Preference**: Implement logic in backend when possible. Avoid complex client-side code
- **API Reuse**: Before creating new APIs, examine existing APIs for required functionality

#### Data Handling
- **No Fake Data**: Do not implement default values or fake data
- **Fail Fast**: Prefer code failure over working with fake data for effective debugging
- **Strong Typing**: Use strong typing throughout. Avoid `any` unless absolutely necessary
- **Interfaces**: Prefer interfaces for complex objects

#### Development Process
- **Certainty Requirement**: Do not implement or change code without being 95% confident
- **Ask Questions**: If there is doubt, ask questions before proceeding
- **Clear Instructions**: Do not start changing code without clear instructions

#### Communication
- **Brevity**: Always be brief in communications. Avoid repetition
- **Focus**: Mention only the main facts

#### Documentation Requirements
- **Journal Entries**: Add entry to `./.context/journal.md` when each feature is finished
- **Required Details**:
  - What the feature is
  - When work started (could be 5 minutes or 2 months ago)
  - When feature was finished and tested
  - Files modified to support the feature
  - Brief description of design implementation
  - Difficulties encountered and solutions

- **Context File Naming Convention**: All context documentation files must follow the format `YYYY-MM-DD-lower-caps.md` (e.g., `2026-01-04-new-visualization-guide.md`)
- **File Header Requirements**: Every context file must include:
  - Date at the top
  - Hashtag keywords associated with the content
  - Detailed context information
- **All context documentation** goes to the .context folder of either the project, or the subfolder that is pertinent to that documentation. For example, if UI, it should go to `./frontend/.context/`

#### Project Structure
- **Tests**: Test files use `*.test.ts` or `*.integration.test.ts` naming, collocated with source or in test directories
- **Documentation**: Project-specific documentation in `.context/` folder

### Repository Pattern (Backend)

#### Repository Isolation Rules (Mandatory)
- **Repositories are the ONLY modules that can access database/storage services directly** (AWS SDK for DynamoDB, S3)
- **All database/storage operations must be encapsulated in repositories**
- **Repositories export business-focused functions, not raw storage operations**
- **Other modules can ONLY call repository functions, never database directly**

#### Repository Function Naming (Mandatory Database Verbs)

##### Database Action Verbs (Required)
- **Read Operations**: `fetch`, `retrieve`, `find`, `search`, `list`
- **Write Operations**: `create`, `insert`, `save`, `store`
- **Update Operations**: `update`, `modify`, `patch`
- **Delete Operations**: `delete`, `remove`, `destroy`

##### Function Naming Pattern
```typescript
// DocumentRepository.ts
export const createDocument = (documentData) => { /* INSERT/PUT to DynamoDB */ }
export const fetchDocumentById = (documentId) => { /* SELECT by ID */ }
export const retrieveDocumentsByUser = (userId) => { /* SELECT with filter */ }
export const updateDocumentMetadata = (documentId, metadata) => { /* UPDATE */ }
export const deleteDocument = (documentId) => { /* DELETE */ }
export const searchDocumentsByName = (searchTerm) => { /* SELECT with LIKE/scan */ }
export const listDocumentsByDateRange = (startDate, endDate) => { /* SELECT with range */ }
```

##### Naming Rules (Mandatory)
- **Single Record**: `fetchUserById()`, `retrieveFileById()`
- **Multiple Records**: `listUsers()`, `retrieveFilesByUser()`
- **Search Operations**: `searchUsersByName()`, `findFilesByType()`
- **Filtered Queries**: `retrieveActiveUsers()`, `fetchRecentFiles()`
- **Always include database intent** in function name

#### Repository Import Pattern (Mandatory)
```typescript
// In services/routes - ONLY way to access data
import { documentRepository } from '../repositories/documentRepository.js'
import { s3Repository } from '../repositories/s3Repository.js'

// Usage in services - explicit database action verbs
const document = await documentRepository.createDocument(documentData)
const documents = await documentRepository.retrieveDocumentsByUser(userId)
```

### Code Reusability Rules (Mandatory)

#### Before Creating New Functions
1. **Search existing utilities**: `grep -r "function_name" backend/src/services/`
2. **Check repositories**: `grep -r "function_name" backend/src/repositories/`
3. **Examine services**: Check for similar business logic patterns
4. **Check frontend services**: `grep -r "function_name" frontend/src/services/`

#### Search Performance Optimization
- **Always exclude build folders** when using find/grep to accelerate search:
  - `grep -r "pattern" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build`
  - `find . -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.*/*"`

#### When to Extract to Utilities
- **After 2nd duplication**: Move to appropriate utility file
- **Cross-module usage**: Any function used by 2+ modules
- **Complex logic**: Any function longer than 10 lines doing generic operations

---

## Project Structure

```
vaisu/
├── frontend/          # React 18 + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/    # UI components (upload, summary, visualizations)
│   │   ├── stores/        # Zustand state management
│   │   ├── services/      # API clients and utilities
│   │   ├── design-system/ # Component library with design tokens
│   │   └── main.tsx       # App entry point
│   └── package.json
├── backend/           # Express + TypeScript backend
│   ├── src/
│   │   ├── routes/        # API endpoints (/api/documents/*)
│   │   ├── services/      # Business logic (LLM, analysis, storage)
│   │   ├── repositories/  # Data access layer (DynamoDB, S3)
│   │   ├── config/        # Configuration (AWS, OpenRouter)
│   │   └── server.ts      # Express server
│   └── package.json
├── shared/            # Shared TypeScript type definitions
│   └── src/types.d.ts
└── package.json       # Root workspace config
```

## Key Technologies

- **Frontend**: React 18, Vite, TypeScript, Zustand, TailwindCSS, D3.js, Cytoscape.js, React Flow
- **Backend**: Express, TypeScript, OpenRouter API, AWS SDK (S3, DynamoDB), Multer
- **Testing**: Vitest with 80% coverage thresholds
- **Build**: TypeScript compiler, Vite, ES modules
- **State**: Zustand global store pattern
- **Styling**: CSS custom properties + Tailwind utilities

## Development Commands

### Essential Commands
```bash
# Start development servers (frontend + backend)
npm run dev

# Start servers individually
npm run dev:backend   # Backend on http://localhost:3001
npm run dev:frontend  # Frontend on http://localhost:5173

# Build for production
npm run build
npm run build:prod    # Full production build

# Run tests with coverage
npm run test
npm run test:coverage

# Run specific test types
npm run test:unit         # Unit tests (*.test.ts)
npm run test:integration  # Integration tests (*.integration.test.ts)

# Code quality
npm run lint              # ESLint
npm run format            # Prettier formatting
npm run type-check        # TypeScript type checking
```

### Testing Commands
- **Non-Interactive Mode**: Always run tests in non-interactive mode using the `--run` flag (e.g., `npm test -- --run` or `vitest run`) to prevent the process from waiting for user input to quit.

```bash
# Run all tests
npm test -- --run

# Run tests with coverage report
npm run test:coverage -- --run

# Run tests in watch mode
npm run test:watch

# Run CI tests (verbose output)
npm run test:ci

# Run single test file
npx vitest run path/to/file.test.ts
```

### Individual Service Commands
```bash
# Backend
cd backend && npm run dev    # Development with tsx watch
cd backend && npm run build  # Compile TypeScript
cd backend && npm run start  # Production start

# Frontend
cd frontend && npm run dev   # Development server
cd frontend && npm run build # Build static files
cd frontend && npm run preview # Preview built files
```

## Architecture Patterns

### State Management (Zustand)
- Global stores in `/frontend/src/stores/`
- Pattern: `set({ ... })` and `get()` for state updates
- Actions handle async operations with loading states
- Error handling with toast notifications

### Service Layer
- Backend services in `/backend/src/services/`
- Class-based with lazy initialization: `private get client()`
- Singleton exports: `export const service = new Service()`
- Fallback patterns for LLM calls

### API Client Pattern
- Frontend API clients in `/frontend/src/services/`
- Object literal with method collection
- Axios-based HTTP requests
- Progress callbacks for long-running operations

### Component Architecture
- Design system in `/frontend/src/design-system/`
- ForwardRef pattern with displayName
- JSDoc documentation for public APIs
- CSS custom properties for theming
- WCAG 2.2 AA accessibility compliance

### Error Handling
- Try-catch with explicit error logging
- Fallback patterns for LLM service failures
- Cache error markers to prevent infinite retries
- Toast notifications for user feedback

## Code Conventions

### TypeScript
```typescript
// Strict mode always enabled
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}

// ES modules with .js extensions required
import { service } from '../services/service.js';
import type { Type } from '../types.js';
```

### Import Patterns
```typescript
// Type-only imports
import type { DocumentAnalysis } from '@shared/types';

// Regular imports
import { textAnalyzer } from '../services/analysis/textAnalyzer.js';
import { Button } from '@/design-system/components';
```

### File Naming
- Components: PascalCase (`Button.tsx`, `ThemeProvider.tsx`)
- Utilities: camelCase (`apiClient.ts`, `documentStore.ts`)
- Hooks: `use` prefix (`useTheme.ts`, `useDebounce.ts`)
- Tests: `*.test.ts` or `*.integration.test.ts`

### Testing Standards
- 80% coverage threshold for all metrics
- Vitest with Node environment
- Mock setup in `/test/setup.ts`
- Unit tests collocated with source code
- Integration tests for API endpoints

## Key Files and Directories

### Frontend Entry Points
- `/frontend/src/main.tsx` - App initialization
- `/frontend/src/App.tsx` - Main component
- `/frontend/src/design-system/ThemeProvider.tsx` - Theme provider

### Backend Entry Points
- `/backend/src/server.ts` - Express server setup
- `/backend/src/routes/documents.ts` - API routes
- `/backend/src/config/aws.js` - AWS/OpenRouter configuration

### Critical Services
- `/backend/src/services/llm/openRouterClient.ts` - LLM client
- `/backend/src/services/analysis/textAnalyzer.ts` - Document analysis
- `/backend/src/services/visualization/visualizationGenerator.js` - Visualization generation

### Shared Types
- `/shared/src/types.d.ts` - Central type definitions
- Imported as `@shared/types` in both frontend and backend

## Environment Configuration

### Backend (.env)
```env
PORT=3001
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_URL=http://localhost:5173
NODE_ENV=development
AWS_REGION=us-east-1
```

### Frontend
- Proxy configured to backend at `http://localhost:3001`
- Path alias: `@shared` → `../shared/src`

## Common Development Tasks

### Adding a New Visualization Type
1. Add to `/backend/src/services/visualization/` with generator function
2. Update `/backend/src/services/analysis/textAnalyzer.ts` to call new generator
3. Add frontend component in `/frontend/src/components/visualizations/`
4. Update store actions for new visualization type
5. Add tests for both backend and frontend

### Adding a New API Endpoint
1. Create route handler in `/backend/src/routes/documents.ts`
2. Add service method in `/backend/src/services/`
3. Add repository method if needed
4. Create frontend API client method
5. Add store action and component integration
6. Write tests for all layers

### Adding a New Component
1. Create component in `/frontend/src/design-system/components/`
2. Add TypeScript types and JSDoc documentation
3. Export from `/frontend/src/design-system/components/index.ts`
4. Add tests in `__tests__/` directory
5. Update documentation in `/frontend/src/design-system/`

## Performance Considerations

- Document analysis can take 10-30 seconds for large documents
- Progress tracking implemented for long-running operations
- Visualization caching to prevent re-computation
- Error caching to prevent infinite retry loops
- Frontend uses lazy loading for visualization components

## Specialized Sub-Agents

### Graphy Agent - Graphical Representation Design
- **Purpose**: Design state-of-the-art visualizations and graphical representations
- **Location**: `/agents/graphy/`
- **Capabilities**:
  - Visualization design specifications
  - Technical architecture planning
  - Aesthetic system design
  - Performance optimization strategies
  - Implementation planning
- **Usage**: When designing new graphical representations, use the Graphy agent for comprehensive design guidance
- **Reference**: `.context/GRAPHICAL_REPRESENTATIONS_GUIDE.md` for complete design system guidelines

### Graphical Representations Design System
- **Location**: `.context/GRAPHICAL_REPRESENTATIONS_GUIDE.md`
- **Covers**:
  - State-of-the-Art Semantic Argument Map UI/UX
  - Dual-metaphor aesthetic system (Dark Mode "Void" vs Light Mode "Lab")
  - Technical implementation with SVG, CSS-in-JS, and basic React components
  - Level of Detail (Semantic Zoom) strategies
  - Performance optimization for high-density data visualization
  - Motion dynamics and interaction patterns

## Skills System

### Graphical Representation Designer Skill
- **Command**: `/skill graphical-representation-designer`
- **Location**: `/.claude/skills/graphical-representation-designer/`
- **Purpose**: Provides comprehensive capabilities for designing state-of-the-art graphical representations
- **Features**:
  - Interactive design specification generation
  - Command-line parameter support
  - Integration with design guidelines
  - Validation against established principles
  - Implementation planning and timeline estimation

**Usage Examples:**
```bash
# Basic usage
/skill graphical-representation-designer

# With parameters
/skill graphical-representation-designer --type="Semantic Argument Map" --purpose="Visualize complex argument structures"

# Interactive mode
/skill graphical-representation-designer
# Follow prompts for detailed input
```

**Output Includes:**
- Design rationale and user experience flow
- Technical architecture and implementation plan
- Visual design system with dual-mode aesthetics
- Performance optimization strategies
- Estimated timeline and complexity assessment
- Validation results against design principles

## Debugging

### Common Issues
- **CORS errors**: Check backend `.env` APP_URL configuration
- **File upload failures**: Verify file size (<1GB) and type (.txt, .pdf, .md)
- **LLM errors**: Check OpenRouter API key and rate limits
- **TypeScript errors**: Run `npm run type-check` for full analysis

### Logging Patterns
- Console logging with emoji prefixes for visibility
- Error logging with context in backend services
- Progress callbacks for user feedback
- Debug information preserved in development

## Deployment

### Production Build
```bash
npm run build:prod  # Install deps and build both services
npm run start:prod  # Start production backend server
```

### Environment Variables
- Required: `OPENROUTER_API_KEY` for LLM functionality
- Optional: `PORT`, `APP_URL`, `NODE_ENV`, `AWS_REGION`
- AWS credentials via environment or IAM roles

This repository follows modern TypeScript/React development practices with strong typing, comprehensive testing, and a component-based architecture designed for maintainability and scalability.
