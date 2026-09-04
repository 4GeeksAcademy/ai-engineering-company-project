# Context — Error handling (archived 2026-08-31)

Course contract (archived here): [`error-handling-context.md`](error-handling-context.md).

## Goal

Apply a consistent error-handling strategy across the existing HealthCore monorepo (frontend, API, scripts). Completed 2026-08-31; course contract stored in this folder.

## Scope (this iteration)

- Shared user-safe error contracts in `uis/web`, sanitized FastAPI errors, CLI export failure handling.
- Keep shipped UIs runnable: `uis/website` (public), `uis/web` (staff JWT).
- Phase 1 incident CLI: `scripts/`.
- Phase 2 API: `services/api/` — incidents, suppliers, staff JWT auth.

## Constraints

- Company briefing: `CONTEXT.md` (do not edit without instruction).
- Milestone 1 static archives and Milestone 2 `src/types/**`, `src/utils/**` — import/reference only until instructed.
- APIs live only under `services/`.
- User/Profile stay in TinyDB only.
- Do not invent production PHI flows or EHR integrations without explicit instruction.

## Essential background

HealthCore: 12 outpatient clinics (US + UK), ~200 staff, ~$28M revenue.

## Relevant files

| Path | Role |
|------|------|
| `error-handling-context.md` (this folder) | Course contract |
| `uis/web/src/lib/apiClient.ts` | `toUserMessage`, `parseError`, timeout |
| `uis/web/src/components/ErrorBanner.tsx`, `uis/web/src/app/error.tsx` | Shared error UI |
| `services/api/app/main.py` | Global sanitized 500 |
| `scripts/analyze.py` | Export `OSError` → stderr + exit 1 |
