# Tech updates — Error handling

## Frontend (`uis/web`)

- `apiClient.ts`: `toUserMessage`, `messageForStatus`, `ApiTimeoutError`, 15s abort, `parseError` does not surface `payload.detail`
- `ErrorBanner.tsx` and `app/error.tsx` (no stack in UI)
- Auth forms and `AuthProvider` distinguish 401 vs outage
- `SupplierDirectory` retry + row busy; `IncidentAnalyzer` uses `parseError`

## Backend (`services/api`)

- Catch-all `Exception` → 500 `{"detail":"Something went wrong. Please try again."}`
- Incidents: `_client_load_error_detail` (no `str(exc)` to clients)
- Suppliers: PATCH 422 via `{detail, errors}`; skip/log corrupt TinyDB docs
- Auth email: forgot-password remains 200 if send fails

## Scripts

- `analyze.py` export `OSError`: stderr + `return 1`

## Tests

- `services/api/tests/test_error_handlers.py`, `test_suppliers_api.py`
- Updates in `test_incidents_api.py`, `test_auth_api.py`, `scripts/tests/test_analyze.py`
