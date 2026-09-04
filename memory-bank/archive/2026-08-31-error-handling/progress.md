# Progress — Error handling (archived 2026-08-31)

## Current state

Complete. Course contract archived in this folder. Implementation shipped on `auth_api` (`5886fc3`); phase closed on `bullet-proof`.

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
- Updated: `test_incidents_api.py`, `test_auth_api.py`, `scripts/tests/test_analyze.py`

## Next steps

None for this iteration. Active work continues on branch `bullet-proof`.
