# HealthCore API

FastAPI surface for:

- Phase 2 incident CSV analysis (reuses `scripts/` validation)
- Milestone 09 supplier directory backed by **TinyDB** + **Pydantic**
- AUTH-01/03 staff authentication (TinyDB users/profiles, JWT bearer, Resend password reset)

`uis/web` (http://localhost:3001) is the authenticated client. `uis/website` (http://localhost:3000) stays public and does not call this API.

## Environment

```bash
cd services/api
cp .env.example .env
```

Set a real `SECRET_KEY` in `.env`. Never commit `.env` or API keys.

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | JWT signing secret (required) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime (default `60`) |
| `RESET_TOKEN_EXPIRE_MINUTES` | Password-reset token lifetime (default `30`) |
| `FRONTEND_BASE_URL` | Used to build reset links (`http://localhost:3001`) |
| `RESEND_API_KEY` | Resend API key; if empty, forgot-password still returns 200 and skips sending |
| `RESEND_FROM_EMAIL` | Resend `from` address (must be allowed by your Resend account) |
| `AUTH_SEED_ADMIN_EMAIL` | Local admin email for `seed-auth` |
| `AUTH_SEED_ADMIN_PASSWORD` | Local admin password for `seed-auth` |

`cryptography` is pinned to `>=42,<45` so `pip`/`uv` can use a prebuilt wheel. `cryptography` 45+ may try to compile from source and fail without OpenSSL/pkg-config.

Users and profiles live in `data/auth.json` (gitignored via `data/`). Supplier seed data is a separate TinyDB file.

## Auth routes

| Method | Path | Auth | Description |
|--------|------|------|------------|
| `POST` | `/users` | Public | Register. Always creates `role=user`. Optional `name`, `phone`, `address` go on the linked profile. |
| `GET` | `/users` | Bearer | List users |
| `GET` | `/users/{id}` | Bearer | Get one user (self or admin) |
| `PUT` | `/users/{id}` | Bearer | Update credentials. Only an admin may change `role`. |
| `DELETE` | `/users/{id}` | Bearer | Delete user and linked profile |
| `GET` | `/profiles/me` | Bearer | Current user's profile |
| `PUT` | `/profiles/me` | Bearer | Update name / phone / address |
| `POST` | `/auth/login` | Public | OAuth2 password form: `username` is the email, plus `password`. Returns `{ access_token, token_type: "bearer" }`. |
| `GET` | `/auth/me` | Bearer | Current email, role, and profile |
| `POST` | `/auth/forgot-password` | Public | Always `200` (no email enumeration). Emails a reset link via Resend when the address exists. |
| `POST` | `/auth/reset-password` | Public | `{ token, new_password }`. Invalid / expired / used token → `400`. |
| `POST` | `/auth/change-password` | Bearer | `{ current_password, new_password }`. Wrong current password → `400`. |

Missing or invalid access tokens return `401`. Cross-user credential updates return `403`. Successful reset or change-password marks unused reset tokens used; existing access JWTs are not revoked.

In `/docs`, use **Authorize** after `POST /auth/login` (OAuth2 password flow).

### Seed a local admin

`POST /users` cannot create an admin.

```bash
cd services/api
uv sync
uv run seed-auth
```

Or without `uv`:

```bash
python3 -m app.auth.seed
```

Default credentials (override with env): `admin@healthcore.example` / `HealthCore!dev-admin`.

## Supplier directory

All supplier routes require a bearer token.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/suppliers` | Register a supplier (Pydantic-validated) |
| `GET` | `/suppliers` | List suppliers (`country`, `category`, `status` query filters) |
| `GET` | `/suppliers/{id}` | Get one supplier |
| `PATCH` | `/suppliers/{id}` | Partial update |
| `PATCH` | `/suppliers/{id}/rate` | Update monthly rate (sets `updated_at`) |
| `PATCH` | `/suppliers/{id}/status` | Activate or suspend (no deletes) |

### Seed TinyDB

```bash
cd services/api
uv sync
uv run seed
```

This loads the exact 15 suppliers from `app/suppliers/seed_data.py`.

## Incident endpoints

Incident analyze/export require a bearer token. `GET /health` stays public.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/incidents/analyze` | Upload CSV; returns JSON summary |
| `GET` | `/api/incidents/results/export` | Download last analysis as metrics CSV |
| `GET` | `/health` | Liveness check |

## Run API

```bash
cd services/api
cp .env.example .env   # then set SECRET_KEY
uv sync
uv run seed
uv run seed-auth
uv run uvicorn app.main:app --reload --port 8000
```

Or with a venv:

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 -m app.auth.seed
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000 — Docs: http://localhost:8000/docs  
CORS allows the internal UI at http://localhost:3001.

## Test

```bash
cd services/api
uv run python -m unittest discover -s tests -v
```

Or:

```bash
python3 -m unittest discover -s tests -v
```

Auth tests isolate TinyDB with a temp file and mock Resend. They do not send real email.
