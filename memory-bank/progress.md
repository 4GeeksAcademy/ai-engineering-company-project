# Progress — Active iteration

## Current state

AUTH-088, API-042, and FE-019 are **implemented** on branch `bullet-proof`. Guide remains at root [`BulletProofApp-Context.md`](../BulletProofApp-Context.md) until you ask to archive it.

## Completed

- AUTH-088 pytest suite + [`TESTING.md`](../TESTING.md) auth matrix (2026-08-31)
- API-042: extended incident and supplier tests (happy / edge / failure)
- FE-019: Jest in `uis/web` for token helpers, `messageForStatus`, `toUserMessage` / `parseError`

## Validation results

- `uv run pytest tests/test_incidents_api.py tests/test_suppliers_api.py`: **26 passed**, 1 Starlette TestClient deprecation warning (2026-09-04)
- `uv run pytest --cov=app.routers.incidents --cov=app.routers.suppliers --cov=app.suppliers --cov-report=term-missing`: **80 passed**, **88%** on selected modules (target ≥60%)
- AUTH-088 remains green in that full run (80 tests include the prior 68 auth/error cases)
- `npm test -w uis/web`: **6 passed** (1 suite); `apiClient.ts` line coverage 56.55% on helpers (no % gate for FE-019)
- `npm run typecheck -w uis/web`: passed
- No application bug found; no production-code fix required

## Tests added or updated

- Incidents: `test_export_without_token_401`, `test_analyze_whitespace_only_csv_returns_400`
- Suppliers: create/get/list/sort, patch rate/status, filters, skip unreadable doc, UK+GBP, unauthenticated 401, patch unknown 404
- New: `uis/web/src/lib/__tests__/apiClient.test.ts`, `uis/web/jest.config.ts`, Jest script and devDependencies in `uis/web/package.json`

## Blockers

- None. Live Resend still needs a local `RESEND_API_KEY` for real inbox delivery (tests mock/skip send).

## Next steps

When you confirm the phase is complete, move `BulletProofApp-Context.md` into `memory-bank/archive/`.

## Run commands (durable)

```bash
cd services/api
uv sync --group dev
uv run pytest
uv run pytest --cov=app.auth --cov-report=term-missing
uv run pytest --cov=app.routers.incidents --cov=app.routers.suppliers --cov=app.suppliers --cov-report=term-missing
uvicorn app.main:app --reload --port 8000

cd scripts
python3 -m unittest discover -s tests -v

npm run dev:web
npm run typecheck
npm test -w uis/web
```

Last updated: 2026-09-04
