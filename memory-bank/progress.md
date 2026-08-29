# Progress — Active iteration

## Current state

On branch `auth_api`. AUTH-01, AUTH-02, and AUTH-03 are implemented in `services/api` and `uis/web`. `uis/website` is unchanged and stays public.

## Completed

- Milestone 1–4 prior deliverables; Incident analyzer CLI + Phase 2 API/UI
- Supplier directory TinyDB API + `uis/web` `/suppliers` UI (archived 2026-08-28)
- AUTH-01: TinyDB `User`/`Profile`, JWT `POST /auth/login`, `get_current_user`, protect suppliers + incidents, `uv run seed-auth`
- AUTH-02: `uis/web` login/register/profile, AuthGuard (`GET /auth/me`), `localStorage` bearer client
- AUTH-03: Resend forgot-password, single-use TinyDB reset `jti`, change-password UI + API
- Cursor `.cursor/rules/global-working-rules.mdc`: Testing and Edge Cases (proportional tests, no weakening tests, report unverified risks)

## Validation results

- `python3 -m unittest discover -s tests -v` in `services/api`: **20 tests OK** (2026-08-28). Resend is mocked.
- `npm run typecheck` (website + `uis/web`): **passed** after removing leftover empty `src/app/{incidents,operations,suppliers}` dirs and stale `.next` types.
- Real Resend inbox delivery was **not** run (no `RESEND_API_KEY` in this environment).
- Browser click-through of `uis/web` was **not** run (no browser automation in this session). API TestClient and typecheck were used instead.

## Blockers

- `uv` was missing at the start of this session; `uv` was installed via pip and `services/api/uv.lock` was regenerated with auth packages.
- Live password-reset email needs a local `.env` with `RESEND_API_KEY` and a permitted `RESEND_FROM_EMAIL`.

## Next steps

1. Copy `services/api/.env.example` → `.env`, set `SECRET_KEY`, optionally `RESEND_API_KEY`.
2. Run API + `npm run dev:web`, then manually verify register → login → profile → forgot/reset (with Resend) → change-password.
3. Commit when the user asks.

## Run commands (durable)

```bash
cd services/api
cp .env.example .env   # set SECRET_KEY
python3 -m pip install -r requirements.txt
python3 -m app.auth.seed
python3 -m unittest discover -s tests -v
uvicorn app.main:app --reload --port 8000

npm run dev:web          # :3001 → /login
npm run typecheck
```

If `uv` is available: `uv sync`, `uv run seed`, `uv run seed-auth`, `uv run uvicorn app.main:app --reload --port 8000`.

Last updated: 2026-08-28
