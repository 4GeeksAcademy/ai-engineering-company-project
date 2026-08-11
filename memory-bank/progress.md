# Progress — Active iteration

## Current state

Supplier Directory (Milestone 09) implemented: TinyDB + Pydantic API under `services/api/`, UI under `uis/web/` at `/suppliers` (internal app formerly called backoffice; `uis/backoffice` is empty/unused).

## Completed

- Milestone 1–4 prior deliverables; Incident analyzer CLI + Phase 2 API/UI
- Supplier TinyDB models, seeder (`uv run seed`), endpoints POST/GET/PATCH
- Backoffice supplier page: client-side filters, register form with 422 errors, inline rate + status updates, active vs suspended styling

## Validation results

- `uv run seed` → Seeded 15 suppliers into TinyDB
- Smoke: GET/POST `/suppliers`, GET `/suppliers/{id}`, PATCH rate/status; invalid UK+USD → 422 Validation failed
- `npm run typecheck -w uis/web` OK

## Blockers

- None for supplier directory MVP.

## Next steps

1. Manual UI check at http://localhost:3001/suppliers with API on :8000
2. Commit/PR when user requests

## Run commands (durable)

```bash
cd services/api
uv sync
uv run seed
uv run uvicorn app.main:app --reload --port 8000

npm run dev:web          # :3001 → /suppliers
npm run typecheck -w uis/web
```

Last updated: 2026-08-10
