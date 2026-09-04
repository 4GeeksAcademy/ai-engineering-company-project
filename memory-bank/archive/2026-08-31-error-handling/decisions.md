# Decisions — Error handling (archived 2026-08-31)

Course contract: [`error-handling-context.md`](error-handling-context.md).

## Adopted (this iteration)

| Decision | Rationale |
|----------|-----------|
| User-facing API errors go through `toUserMessage` / status maps, never raw `detail` or `Error.message` | Course forbids stack traces, status codes, and parse errors in the UI |
| FastAPI unhandled exceptions return a fixed 500 JSON body; logs stay server-side | Prevents traceback/secret leaks to clients |
| Website enquiry form stays client-only (no new enquiry API) | Wiring persistence would be a new feature |
| `apiFetch` uses a 15s `AbortController` timeout | Avoids hung UI with no rejected state |
| AuthProvider treats 401 as logout and network/5xx as session error with retry | Distinguishes expired session from API outage |
| Incident `LoadError` maps to a stable 400, not `str(exc)` | Clients must not see Python exception text |
| Supplier PATCH 422 body is `{detail, errors}` | Aligns with frontend field-error handling |
| Forgot-password still returns 200 if Resend send fails | Avoids email enumeration |

## Rejected (for now)

| Alternative | Why rejected |
|-------------|--------------|
| Persist website enquiry via a new API | Out of error-handling scope |
| Show raw FastAPI `detail` in the UI | Course forbids it |
