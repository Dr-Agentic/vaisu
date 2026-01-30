# Scaffolding Guidelines

When Scaffy clones the Vaisu project, it should adhere to these specific modifications:

## General

- **Cleanliness**: Remove all business logic related to "Document Analysis", "Visualizations", "Text-to-Visual", and "LLM processing". The new app should be a clean slate (User Management + Billing + App Shell).

## Backend

- **Auth**: Keep `src/services/auth/`, `src/routes/auth.ts`, `src/middleware/auth.ts`.
- **Billing**: Keep `src/services/billing/` (or create if missing), `src/routes/billing.ts`.
- **Database**:
  - If **DynamoDB**: Replicate `src/repositories/userRepository.ts` and `sessionRepository.ts` exactly.
  - If **Postgres**: Create `src/db/schema.ts` using Drizzle ORM. Define `users` and `sessions` tables. Create `src/repositories/postgresUserRepository.ts`.

## Frontend

- **Components**: Copy all generic components from `components/primitives` and `components/patterns`.
- **Themes**: Ensure `design-system/tokens.ts` is copied. If the user requested a new theme, MODIFY the color values in this file before writing it.
- **Routing**: `App.tsx` should have routes for `/login`, `/register`, `/dashboard`, `/settings`.

## Mobile (New)

- **Stack**: React Native + Expo + NativeWind (Tailwind).
- **Structure**:
  - `app/` (Expo Router)
  - `components/` (Ported from frontend)
  - `constants/` (Theme tokens)
- **Shared Code**: If possible, setup a monorepo structure (Turborepo) to share `types` and logic between `frontend` and `mobile`. If not executing a full monorepo setup, copy the `shared/types.d.ts` to both projects.
