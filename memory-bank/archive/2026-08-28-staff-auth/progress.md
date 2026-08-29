# Progress — Staff auth (archived 2026-08-28)

## Final state

On branch `auth_api`. AUTH-01, AUTH-02, and AUTH-03 implemented in `services/api` and `uis/web`. `uis/website` unchanged and public.

## Completed

- AUTH-01: TinyDB `User`/`Profile`, JWT `POST /auth/login`, `get_current_user`, protect suppliers + incidents, `uv run seed-auth`
- AUTH-02: `uis/web` login/register/profile, AuthGuard (`GET /auth/me`), `localStorage` bearer client
- AUTH-03: Resend forgot-password, single-use TinyDB reset `jti`, change-password UI + API

## Validation results

- `python3 -m unittest discover -s tests -v` in `services/api`: **20 tests OK** (2026-08-28). Resend is mocked.
- `npm run typecheck` (website + `uis/web`): **passed** after removing leftover empty `src/app/{incidents,operations,suppliers}` dirs and stale `.next` types.
- Real Resend inbox delivery was **not** run (no `RESEND_API_KEY` in this environment).
- Browser click-through of `uis/web` was **not** run. API TestClient and typecheck were used instead.

## Blockers at archive

- Live password-reset email needs a local `.env` with `RESEND_API_KEY` and a permitted `RESEND_FROM_EMAIL`.
- `uv` was missing at session start; installed via pip; `services/api/uv.lock` regenerated with auth packages.

## Run commands

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
