# Progress — Active iteration

## Current state

Error-handling implementation is **complete** (not archived). Guide remains at root [`error-handling-context.md`](../error-handling-context.md) until you ask to archive it. Branch `auth_api`.

## Completed

- Shared `toUserMessage` / `parseError` (no raw `detail` in UI), `ErrorBanner`, `uis/web` `app/error.tsx`, `apiFetch` timeout
- Forgot-password catch + retry; AuthProvider 401 vs outage; auth forms; suppliers retry + row busy; IncidentAnalyzer uses `parseError`
- FastAPI global sanitized 500; incident `LoadError` mapped to stable 400; supplier 422 `{detail, errors}`; Resend send failures stay 200
- CLI export `OSError` → stderr + exit 1

## Validation results

- `cd services/api && python3 -m unittest discover -s tests -v`: **29 tests OK** (2026-08-28)
- `cd scripts && python3 -m unittest discover -s tests -v`: **20 tests OK**
- `npm run typecheck`: **passed**
- Dev servers were started for local click-through (`uis/web` :3001, API :8000). Agent did not drive the browser.

## Tests added or updated

- New: `services/api/tests/test_error_handlers.py`, `services/api/tests/test_suppliers_api.py`
- Updated: `test_incidents_api.py` (stable CSV 400), `test_auth_api.py` (forgot-password send failure still 200), `scripts/tests/test_analyze.py` (missing file, bad UTF-8, export I/O)

## Blockers

- Live password-reset email still needs a local `.env` with `RESEND_API_KEY` if you want real inbox delivery.

## Next steps

1. When you confirm the phase is complete, move `error-handling-context.md` into `memory-bank/archive/`.
2. Optionally keep smoking `uis/web` in the browser (forgot-password failure, API down on session, suppliers retry, incidents bad CSV).

## Run commands (durable)

```bash
cd services/api
python3 -m unittest discover -s tests -v
uvicorn app.main:app --reload --port 8000

cd scripts
python3 -m unittest discover -s tests -v

npm run dev:web
npm run typecheck
```

Last updated: 2026-08-28
