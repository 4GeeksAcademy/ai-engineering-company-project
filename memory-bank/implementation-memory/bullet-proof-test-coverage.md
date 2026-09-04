# Bullet-proof test coverage

## Purpose

Unit-test coverage for staff authentication, incident/supplier backoffice APIs, and staff-UI error/token helpers so regressions cannot slip through unnoticed.

## Final Behavior

- Every auth endpoint has happy-path, edge-case, and failure-mode pytest coverage. `app.auth` measured at 94% (omit `seed.py`).
- Incidents and suppliers have the same three-tier structure. Selected modules measured at 88%.
- `uis/web` Jest covers token storage, `messageForStatus`, and `toUserMessage` / `parseError` (raw `detail` never shown).
- Commands and results live in root [`TESTING.md`](../../TESTING.md).

## Architecture and Data Flow

Tests hit FastAPI via Starlette TestClient. Auth uses a temp TinyDB (`AUTH_DB_PATH`). Suppliers patch `suppliers_table` to in-memory TinyDB. Incidents use the graded CSV fixture. Jest runs in jsdom against `apiClient.ts` only.

## Important Files

- `services/api/tests/` — pytest modules
- `uis/web/src/lib/apiClient.ts` — helpers under FE-019
- `uis/web/src/lib/__tests__/apiClient.test.ts`
- `uis/web/jest.config.ts`
- `TESTING.md`

## Interfaces and Contracts

- Auth: TinyDB users/profiles, JWT bearer, `POST /auth/login` with `username` = email
- Incidents: `POST /api/incidents/analyze`, `GET /api/incidents/results/export`
- Suppliers: `/suppliers` CRUD/list/filter/rate/status
- UI errors: `toUserMessage` / `messageForStatus`; no stacks or status codes in copy

## Decisions and Constraints

- pytest via `uv`; do not rewrite existing unittest files
- Jest only in `uis/web` (`next/jest`)
- Do not open production `data/auth.json` or `data/suppliers.json` in tests

## Validation

Observed 2026-08-31 and 2026-09-04 as recorded in `TESTING.md`. Full pytest: 80 passed. Jest: 6 passed. Typecheck passed. No production-code fix required.

## Maintenance Notes

Re-run `cd services/api && uv run pytest` and `npm test -w uis/web` after auth, incident, supplier, or `apiClient` changes. Coverage commands are in `TESTING.md`. Live Resend still needs a local `RESEND_API_KEY`.
