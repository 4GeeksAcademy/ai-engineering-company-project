# HealthCore Digital — Web (internal)

Internal Next.js console (port **3001**) for operations analytics, incident analysis, and the supplier directory. Course path: `uis/web/`. Sign-in is required; the public website (`uis/website`) is separate and stays unauthenticated.

## Run

From the repository root (API must be running on port 8000):

```bash
npm install
npm run dev:web
```

Open http://localhost:3001 — you will be redirected to `/login`. Register a user, or seed a local admin (see [`services/api/README.md`](../../services/api/README.md)).

Public routes: `/login`, `/register`, `/forgot-password`, `/reset-password`.  
Protected routes (AuthGuard + `GET /auth/me`): `/`, `/operations`, `/incidents`, `/suppliers`, `/account/profile`, `/account/change-password`.

The access token is stored in `localStorage`. Do not add Next.js middleware for that check.

## Incident analysis (Phase 2)

1. Start the API on port 8000 (see [`services/api/README.md`](../../services/api/README.md)).
2. Optionally copy [`.env.example`](./.env.example) to `.env.local`.
3. Sign in, then open http://localhost:3001/incidents and upload a HealthCore incident CSV (e.g. [`scripts/incidents-healthcore.csv`](../../scripts/incidents-healthcore.csv)).

The UI calls `POST /api/incidents/analyze` and `GET /api/incidents/results/export` with a bearer token. Patient IDs are never displayed.

## Typecheck

```bash
npm run typecheck -w uis/web
```
