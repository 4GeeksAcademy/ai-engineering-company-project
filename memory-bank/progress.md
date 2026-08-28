# Progress — Active iteration

## Current state

On branch `auth_api`. Supplier Directory (Milestone 09) is complete and archived. Auth phase source of truth is [`authentication_context.md`](../authentication_context.md). Implementation has not started.

## Completed

- Milestone 1–4 prior deliverables; Incident analyzer CLI + Phase 2 API/UI
- Supplier directory TinyDB API + `uis/web` `/suppliers` UI (archived 2026-08-28)
- Auth phase briefing written at repo root (architecture-derived; no course file was supplied)

## Validation results

- Supplier directory: seed, smoke endpoints, and `npm run typecheck -w uis/web` passed before merge (see archive).
- Auth briefing present; endpoints not yet implemented.

## Blockers

- None for starting auth implementation.

## Next steps

1. Implement auth under `services/api` per [`authentication_context.md`](../authentication_context.md): seed users, `POST /auth/token`, `GET /auth/me`, protect suppliers + incidents.
2. Add `uis/web` login, Bearer on API calls, sign-out.

## Run commands (durable)

```bash
cd services/api
uv sync
uv run seed
uv run uvicorn app.main:app --reload --port 8000

npm run dev:web          # :3001
npm run typecheck -w uis/web
```

Last updated: 2026-08-28
