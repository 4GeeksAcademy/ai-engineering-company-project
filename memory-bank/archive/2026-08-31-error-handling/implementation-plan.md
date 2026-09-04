# Implementation plan — Error handling (archived)

Completed 2026-08-31. Course contract archived as [`error-handling-context.md`](error-handling-context.md).

## Delivered

- Shared frontend error contract: `toUserMessage`, `parseError`, `ErrorBanner`, `app/error.tsx`, `apiFetch` timeout
- Auth, suppliers, and incidents UIs: loading / fulfilled / rejected with retry or next action
- FastAPI: global sanitized 500; incident CSV load errors as stable 400; supplier 422 `{detail, errors}`; forgot-password send failure still 200
- CLI: export `OSError` writes to stderr and exits 1; no success print after failure

## Out of scope (intentional)

- Website `EnquiryForm` (client-only; no new API)
- Operations analytics (no fetch)
- Milestone 1 archives; `src/types` / `src/utils`
