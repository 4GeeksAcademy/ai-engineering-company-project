# AUTH-088 test plan and results

Authentication test coverage for HealthCore Digital (`services/api`). Primary ticket AUTH-088 is complete. Optional API-042 and FE-019 results are in the sections below.

## How to run

From `services/api` (required assignment runners):

```bash
uv sync --group dev
uv run pytest
uv run pytest --cov=app.auth --cov-report=term-missing
```

API-042 coverage on incidents and suppliers:

```bash
cd services/api
uv run pytest tests/test_incidents_api.py tests/test_suppliers_api.py
uv run pytest --cov=app.routers.incidents --cov=app.routers.suppliers --cov=app.suppliers --cov-report=term-missing
```

Secondary (still valid; not the AUTH-088 runner):

```bash
cd services/api
python3 -m unittest discover -s tests -v
```

FE-019 frontend utilities (from repo root):

```bash
npm test -w uis/web
```

TypeScript / Jest was not required for AUTH-088. `uis/web` has no JWT create/parse or password helpers; [`uis/web/src/lib/authApi.ts`](uis/web/src/lib/authApi.ts) only wraps `fetch`. Token storage, status maps, and `parseError` in [`uis/web/src/lib/apiClient.ts`](uis/web/src/lib/apiClient.ts) are covered by FE-019.

## Isolation

- Tests use a temporary TinyDB file via `AUTH_DB_PATH` ([`services/api/tests/helpers.py`](services/api/tests/helpers.py)). Production `data/auth.json` is never opened.
- `SECRET_KEY` is a test-only value set in helpers. No production credentials or `.env` secrets.
- Resend is mocked at the router (`send_reset_email`) or skipped when `RESEND_API_KEY` is unset.
- `conftest.py` resets the auth DB before every test. Incident tests clear the in-memory analysis store. Supplier tests patch `suppliers_table` to an in-memory TinyDB so production `data/suppliers.json` is never opened.

## What the suite covers

Python pytest modules under `services/api/tests/`, organized by authentication endpoint. Existing incident, supplier, and error-handler tests remain and are collected by pytest.

Coverage target: **at least 70%** on the `app.auth` package.

### Endpoint matrix

Each row is the business rule the tests prove.

**POST /users (register)**

- Happy: 201, `role` is always `user`, bcrypt hash stored, password not in the response.
- Edge: duplicate email returns 409.
- Failure: missing/invalid email or empty password returns 422.

**GET /users**

- Happy: bearer list includes the authenticated user.
- Edge: after a DB reset, the list contains only users created in that test.
- Failure: missing token returns 401.

**GET /users/{id}**

- Happy: a user can read their own record.
- Edge: an admin can read another user.
- Failure: a non-admin cannot read another user (403); unknown id returns 404.

**PUT /users/{id}**

- Happy: a user can update their own email/password.
- Edge: duplicate email returns 409; only an admin may change `role`.
- Failure: cross-user update returns 403; non-admin setting `role` returns 403.

**DELETE /users/{id}**

- Happy: self-delete succeeds; subsequent login fails.
- Edge: an admin can delete another user.
- Failure: cross-user delete returns 403; unknown id returns 404.

**POST /auth/login**

- Happy: returns `access_token` and `token_type=bearer`; JWT `sub` is the TinyDB user id.
- Edge: empty username/password is rejected.
- Failure: wrong password or unknown email returns 401; inactive user returns 401.

**GET /auth/me**

- Happy: returns email, role, and profile.
- Edge: a leftover JWT after deactivation returns 401.
- Failure: missing token returns 401.

**POST /auth/forgot-password**

- Happy: known active user returns 200 and `send_reset_email` is called.
- Edge: unknown email still returns 200 and does not send (no enumeration).
- Failure: send exception still returns 200; invalid email returns 422.

**POST /auth/reset-password**

- Happy: password changes and login works with the new password.
- Edge: the same reset token cannot be reused (400).
- Failure: expired or malformed token returns 400; an access JWT used as a reset token returns 400.

**POST /auth/change-password**

- Happy: password changes and login works with the new password.
- Edge: empty body returns 422.
- Failure: wrong current password returns 400; unauthenticated returns 401.

**GET /profiles/me**

- Happy: profile matches fields sent at register.
- Edge: omitted profile fields are null.
- Failure: missing token returns 401.

**PUT /profiles/me**

- Happy: name/phone update persists.
- Edge: partial update leaves other fields.
- Failure: missing token returns 401.

### Token and password rules

- Malformed bearer and expired access tokens return 401.
- A reset JWT used as `Authorization` returns 401.
- Passwords are hashed with bcrypt; plaintext is never returned or compared in assertions except as the input to `verify_password` / login.

## Why these cases matter

Auth failures are security-relevant: duplicate accounts, email enumeration, leftover sessions after deactivation, and mixing access vs reset tokens would let the wrong person in or leak whether an email is registered. The three-tier structure (happy / edge / failure) is required by AUTH-088.

## AI-assisted findings

Identified while inspecting [`app/auth/security.py`](services/api/app/auth/security.py) and [`app/routers/auth.py`](services/api/app/routers/auth.py) (not present in the previous unittest file). Implemented and passing:

1. Inactive user with a leftover access JWT is rejected by `get_current_user` (`test_me_rejects_token_after_user_deactivated`).
2. An access JWT (`typ` absent) is rejected as a reset token (`test_access_token_rejected_as_reset_token`).
3. A reset JWT (`typ=reset`) is rejected as a bearer access token (`test_reset_token_rejected_as_bearer`).

No application bug was found that required a production-code fix. If a later run exposes one, document the defect, the smallest fix, and the regression test here.

## Measured results

Observed 2026-08-31 from `services/api` (do not treat as passing unless this matches a later re-run):

```bash
uv sync --group dev
uv run pytest
# 68 passed, 1 warning in 196.22s
# warning: Starlette TestClient deprecation (httpx → httpx2); not a test failure

uv run pytest --cov=app.auth --cov-report=term-missing
# 68 passed, 1 warning in 171.77s
```

Authentication module coverage (`app.auth`, `app/auth/seed.py` omitted as a CLI seeder): **94%** (255 statements, 16 missed). Target was ≥70%.

| File | Cover |
|------|--------|
| `app/auth/__init__.py` | 100% |
| `app/auth/config.py` | 92% |
| `app/auth/db.py` | 100% |
| `app/auth/email.py` | 84% |
| `app/auth/models.py` | 100% |
| `app/auth/security.py` | 95% |
| `app/auth/service.py` | 90% |
| **TOTAL** | **94%** |

Uncovered lines are unused branches (missing `SECRET_KEY`, default DB path when `AUTH_DB_PATH` is unset, `ImportError` for resend, non-integer JWT `sub`, empty `update_user`, unused `mark_reset_used`). No production-code change was required.

The three AI-assisted cases (inactive leftover JWT, access token as reset token, reset token as bearer) are implemented and passing. No application bug was found.

## API-042 — Backoffice endpoint tests

Two non-auth groups: incidents (`POST /api/incidents/analyze`, `GET /api/incidents/results/export`) and suppliers (list/create/get/patch rate/status). Existing unittest files were extended; prior assertions were not rewritten.

Supplier tests keep an in-memory TinyDB patch so production `data/suppliers.json` is never opened.

### Incidents

- Happy: graded fixture analyze (100 records, 94 valid); export after analyze is CSV without patient ids.
- Edge: empty bytes, whitespace-only `.csv`, missing headers, non-UTF-8 — all stable 400 copy.
- Failure: missing upload field 422; non-CSV 400; export with no analysis 404; analyze or export without token 401.

### Suppliers

- Happy: POST 201 stores fields; GET by id; list includes rows sorted by name; PATCH rate updates `monthly_rate` and `updated_at`; PATCH status to `suspended`.
- Edge: list filters by `country` / `category` / `status`; list skips an unreadable TinyDB document; UK + GBP create succeeds.
- Failure: list/create/get/patch without token 401; missing GET 404; empty PATCH 400; UK+USD create 422; invalid rate 422; PATCH unknown id 404.

### Measured results (API-042)

Observed 2026-09-04 from `services/api`:

```bash
uv run pytest tests/test_incidents_api.py tests/test_suppliers_api.py
# 26 passed, 1 warning in 24.89s

uv run pytest --cov=app.routers.incidents --cov=app.routers.suppliers --cov=app.suppliers --cov-report=term-missing
# 80 passed, 1 warning in 69.76s
```

Selected-module coverage (target ≥60%): **88%** (264 statements, 32 missed).

| File | Cover |
|------|--------|
| `app/routers/incidents.py` | 96% |
| `app/routers/suppliers.py` | 94% |
| `app/suppliers/__init__.py` | 100% |
| `app/suppliers/db.py` | 83% |
| `app/suppliers/models.py` | 79% |
| `app/suppliers/seed_data.py` | 0% (CLI seed rows; not request-handling) |
| **TOTAL** | **88%** |

No application bug was found. AUTH-088 cases remained passing in the full 80-test run.

## FE-019 — Frontend utility tests

Jest in `uis/web` only (`next/jest`, jsdom). Tests: [`uis/web/src/lib/__tests__/apiClient.test.ts`](uis/web/src/lib/__tests__/apiClient.test.ts). Fetch wrappers in `authApi.ts` / `suppliersApi.ts` and the public-site enquiry validator are out of scope.

| Function | Happy path | Failure mode |
|----------|------------|--------------|
| `setAccessToken` / `getAccessToken` / `clearAccessToken` | round-trip `healthcore_access_token` | missing token is `null`; clear removes the key |
| `messageForStatus` | 401 / 403 / 404 / 422 / 500 map to user copy | 418 uses the generic fallback; no status code in the string |
| `toUserMessage` / `parseError` | `ApiHttpError(401)` and `ApiTimeoutError` map to sentences | raw `Error("SECRET leaked")` and a 500 `detail` body never appear in the returned string |

### Measured results (FE-019)

Observed 2026-09-04 from repo root:

```bash
npm test -w uis/web
# Test Suites: 1 passed; Tests: 6 passed
```

`apiClient.ts` line coverage on that run was 56.55% (helpers under test; `apiFetch` and related plumbing are untested by design). `npm run typecheck -w uis/web` also passed. No application bug was found.
