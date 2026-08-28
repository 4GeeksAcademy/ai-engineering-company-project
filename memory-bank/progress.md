# Progress — Active iteration

## Current state

On branch `auth_api`. Supplier Directory (Milestone 09) is complete and merged to `main` (PR #2). Course briefing archived under `memory-bank/archive/2026-08-28-supplier-directory/`.

Auth API iteration has not started: root briefing `authentication_context.md` is not present yet.

## Completed

- Milestone 1–4 prior deliverables; Incident analyzer CLI + Phase 2 API/UI
- Supplier directory TinyDB API + `uis/web` `/suppliers` UI (archived 2026-08-28)

## Validation results

- Supplier directory: seed, smoke endpoints, and `npm run typecheck -w uis/web` passed before merge (see archive).

## Blockers

- Auth briefing not yet provided.

## Next steps

1. Add [`authentication_context.md`](../authentication_context.md) (course briefing or architecture-derived auth requirements).
2. Implement auth API under `services/` per that briefing and `docs/architecture_proposal.md`.

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
