# AGENTS.md - Vaisu Project Guidelines

This file provides context and rules for AI agents operating in the Vaisu codebase.

## 1. Project Overview

Vaisu is a text-to-visual intelligence application.

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, TypeScript, DynamoDB (AWS SDK v3), S3
- **AI**: OpenRouter API for LLM calls (TextAnalyzer service)

## 2. Build & Test Commands

### Backend (`/backend`)

- **Install**: `npm install`
- **Dev Server**: `npm run dev` (Runs `tsx watch src/server.ts`)
- **Build**: `npm run build` (Outputs to `dist/`)
- **Test (All)**: `npm test` (Uses Vitest)
- **Test (Single)**: `npx vitest run src/path/to/file.test.ts`
- **Lint**: `npm run lint`

### Frontend (`/frontend`)

- **Install**: `npm install`
- **Dev Server**: `npm run dev`
- **Test**: `npm test`
- **Lint**: `npm run lint`

## 3. Code Style & Conventions

### Architecture

- **Repository Pattern**: Database logic lives _strictly_ in `src/repositories/`. Services and Routes should not access DynamoDB/S3 directly.
- **Service Layer**: Business logic (especially LLM calls) lives in `src/services/`.
- **Routes**: Thin layer handling HTTP req/res, calling services/repositories.

### TypeScript

- **Strict Mode**: Enabled. No `any` unless absolutely necessary (and commented).
- **Interfaces**: Prefer `interface` over `type` for object definitions.
- **Shared Types**: Core domain types (Document, Analysis) are in `shared/src/types.d.ts`.

### Naming

- **Files**: camelCase for TS files (e.g., `textAnalyzer.ts`), PascalCase for React components (e.g., `FileUploader.tsx`).
- **Variables**: camelCase.
- **Constants**: UPPER_SNAKE_CASE for environment/config constants.

### Error Handling

- Use `try/catch` blocks in async functions.
- Log errors using `console.error` with context (e.g., `console.error('Failed to analyze:', error)`).
- Return structured error responses from API: `res.status(500).json({ error: message })`.

### Formatting

- Follow Prettier defaults (2 spaces indent, single quotes, semi-colons).
- Imports: Group by external (react, express) vs internal (../services).

## 4. Development Rules

1. **Performance**: The `/analyze` endpoint is heavy. Avoid adding more synchronous blocking calls. Prefer asynchronous processing where possible.
2. **Environment**: Secrets go in `.env`. Never commit API keys.
3. **Tests**: When adding new features, add corresponding unit tests in `__tests__` directories co-located with source.

## 5. Key Files

- `backend/src/services/analysis/textAnalyzer.ts`: Core analysis logic.
- `backend/src/routes/documents.ts`: Main document API.
- `shared/src/types.d.ts`: Data models.
