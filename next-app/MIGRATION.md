# Next.js Migration Progress

## Done in this step
- Created `next-app` (Next.js 16, App Router, TypeScript, Tailwind).
- Added backend dependencies required by the current API (`pg`, `zod`, `bcryptjs`, `dotenv`).
- Copied server business modules into `next-app/src/server`:
  - `auth.mjs`
  - `billing.mjs`
  - `db.mjs`
  - `openrouter.mjs`
- Added shared server helpers:
  - `src/server/schemas.mjs`
  - `src/server/core.mjs`
- Implemented Next Route Handlers:
  - `GET /api/health`
  - `GET /api/auth/me`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/pricing`
  - `GET /api/subscription/me`
  - `GET|POST /api/resumes`
  - `GET|PUT|DELETE /api/resumes/[id]`
- Added root scripts for Next app:
  - `npm run next:dev`
  - `npm run next:build`
  - `npm run next:start`

## Build status
- `next-app` builds successfully with all listed API routes.

## Route migration map (frontend)
Current React Router routes and planned Next App Router targets:
- `/` -> `src/app/page.tsx`
- `/login` -> `src/app/login/page.tsx`
- `/app` -> `src/app/app/page.tsx`
- `/app/builder/:resumeId` -> `src/app/app/builder/[resumeId]/page.tsx`
- `/app/builder/:resumeId/analysis` -> `src/app/app/builder/[resumeId]/analysis/page.tsx`
- `/app/subscription` -> `src/app/app/subscription/page.tsx`
- `/app/payment/success` -> `src/app/app/payment/success/page.tsx`
- `/view/:resumeId` -> `src/app/view/[resumeId]/page.tsx`

## Next step
Port the client app pages/components to Next App Router one-by-one, starting from:
1. auth/session context + i18n bootstrap
2. `/login`
3. `/app` dashboard
4. builder + preview flow
