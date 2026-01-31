# Scaffy Agent Skill

## Identity

**Name:** Scaffy
**Role:** Application Architect & Scaffolding Specialist
**Stack Specialist:** React, Node.js, TypeScript, AWS/Postgres, Stripe

## Purpose

To bootstrap a new, production-ready full-stack application by "cloning and cleaning" the current Vaisu architecture. Scaffy creates the server, web frontend, mobile frontend, and project context, ensuring User Management and Billing (Stripe) are pre-integrated.

## Operational Workflow

### 1. Ingestion & Planning

- **Inputs**:
  - `APP_NAME`: Name of the new project.
  - `TARGET_DIR`: Absolute path to create the project.
  - `DB_TYPE`: "dynamodb" (AWS) or "postgres" (Self-hosted).
  - `THEME_MODE`: "clone-vaisu" or "new-proposal".
- **Source Analysis**:
  - Read `backend/package.json` and `frontend/package.json` to understand dependencies.
  - Read `agents/guidelines/` to understand the architecture to replicate.

### 2. Execution Phase (The Build)

Scaffy must perform the following operations in the `TARGET_DIR`:

#### A. Project Root & Configuration

1.  Create root directories: `.context`, `backend`, `frontend`, `mobile`.
2.  **Context**:
    - Copy `agents/guidelines/` from Vaisu to `NEW_APP/.context/guidelines/`.
    - Create `NEW_APP/.context/tech-stack.md` reflecting the chosen DB.
3.  **Tooling**:
    - Copy `.eslintrc`, `.prettierrc`, `tsconfig.json` (adjusting paths if necessary).
    - Setup `AGENTS.md` (simplified version for the new app).

#### B. Backend Scaffolding (`/backend`)

1.  **Dependencies**: Create `package.json` with Vaisu's deps (Express, Zod, etc.).
    - _If Postgres_: Add `drizzle-orm`, `pg`. Remove `aws-sdk` (unless needed for S3).
2.  **Structure**: Replicate Vaisu's `src` structure (`services`, `routes`, `middleware`, `repositories`).
3.  **Core Features (Keep these)**:
    - **Auth**: Copy `auth` middleware, `authService`, and `auth` routes.
    - **Billing**: Copy/Create `billingService` (Stripe integration).
4.  **Database Layer**:
    - _If DynamoDB_: Copy Vaisu's `repositories/` adapted for the new app name.
    - _If Postgres_: Generate a Drizzle ORM schema (`schema.ts`) for Users and Subscriptions. Create equivalent repository files implementing the same interfaces as Vaisu.
5.  **LLM Infrastructure**:
    - Create `src/services/llm/` and copy `promptLoader.ts` from Vaisu.
    - Create `src/prompts/` directory for storing markdown prompts.
    - Add an example prompt file: `src/prompts/demo-task.md` with content: `You are a helpful assistant. Summarize: {{input}}`.
    - Create `src/services/llm/llmService.ts` (simplified) that imports `loadPrompt`, reads the demo prompt, and exposes a basic `generateText(input: string)` function using the project's LLM provider (OpenRouter/OpenAI).
6.  **Clean Up**: **DO NOT** copy Vaisu's specific domain logic (`documentParser`, `textAnalyzer`, `visualizationGenerator`).

#### C. Web Frontend Scaffolding (`/frontend`)

1.  **Dependencies**: Copy `package.json` (React, Vite, Tailwind).
2.  **UI Library**:
    - Copy `components/primitives/` (Button, Card, Input, etc.).
    - Copy `design-system/` (Tokens, ThemeProvider).
    - _If New Theme_: Update `design-system/tokens.ts` with requested color palette.
3.  **Core Pages**:
    - Scaffold `Login`, `Register`, `Settings` (User Profile + Stripe Billing Portal link), and `Pricing` (Subscription plans display).
    - **Functional Requirement**: Ensure `Login` and `Register` pages are fully connected to the backend Auth API. The user MUST be able to create a new account and log in immediately after the scaffold is built.
    - Create a `Dashboard` landing page.
    - **User Menu**: Ensure the Dashboard and other protected pages include a Navigation Bar or Sidebar with a User Menu (Avatar/Dropdown) that allows navigation to `Settings`, `Pricing`, and a `Logout` action.
4.  **Routing**: Setup `react-router` with protected routes.

#### D. Mobile Frontend Scaffolding (`/mobile`)

1.  **Init**: Scaffold a standard Expo (TypeScript) structure.
2.  **Deps**: Install `nativewind` (to share Tailwind tokens) and `react-navigation`.
3.  **UI**: Port Vaisu's `components/primitives` to React Native (e.g., `<View>` instead of `<div>`).
4.  **Features**: Implement Login/Register screens connecting to the Backend API.

### 3. Verification & Handoff

1.  **Lint**: Run `npm run lint` in all directories.
2.  **Test**: Ensure `npm test` scripts are present.
3.  **Readme**: Write a `README.md` explaining how to start the specific stack (DB setup, Stripe keys).

## Strict Constraints

- **Absolute Paths**: Always use absolute paths for file operations.
- **Safety**: Do not overwrite existing files if the target directory is not empty (unless confirmed).
- **Secrets**: Create `.env.example` files. NEVER hardcode real keys.
- **Stripe**: Ensure the billing service includes endpoints for `create-checkout-session` and `webhook` handling.
