# Progress — Supplier Directory (archived 2026-08-28)

## Final state

Milestone 09 complete. Branch `Supplier-Directory-Tinydb` merged to GitHub `main` (PR #2, 2026-08-27). Briefing archived as `context.md` in this folder.

## Completed

- TinyDB models, seeder (`uv run seed`), endpoints POST/GET/PATCH
- Backoffice supplier page: client-side filters, register form with 422 errors, inline rate + status updates, active vs suspended styling

## Validation results

- `uv run seed` → Seeded 15 suppliers into TinyDB
- Smoke: GET/POST `/suppliers`, GET `/suppliers/{id}`, PATCH rate/status; invalid UK+USD → 422 Validation failed
- `npm run typecheck -w uis/web` OK

## Blockers

- None for supplier directory MVP.

## Run commands (durable)

```bash
cd services/api
uv sync
uv run seed
uv run uvicorn app.main:app --reload --port 8000

npm run dev:web          # :3001 → /suppliers
npm run typecheck -w uis/web
```

Last updated: 2026-08-28
