# Progress — Active iteration

## Current state

Staff auth (AUTH-01/02/03) is **complete and archived** under [`archive/2026-08-28-staff-auth/`](archive/2026-08-28-staff-auth/). Branch `auth_api`. No new course milestone is in progress.

Memory bank root files were reset 2026-08-28 to standing facts plus this idle/next-work state. Cursor working rules now include Testing and Edge Cases (`.cursor/rules/global-working-rules.mdc`).

## Completed (this reset)

- Archived AUTH iteration with context, spec, progress, decisions, implementation-plan, and tech-updates.
- Root memory files limited to active-iteration + standing product facts.

## Validation results

- This change is docs-only (memory-bank layout). No runtime tests.
- Confirmed archive folder contains the six expected files; root still has `context.md`, `spec.md`, `progress.md`, `decisions.md`.
- AUTH implementation validation remains as recorded in the archive (20 API tests OK, typecheck passed; live Resend and browser click-through not run).

## Blockers

- Live password-reset email still needs a local `.env` with `RESEND_API_KEY` and a permitted `RESEND_FROM_EMAIL`.

## Next steps

1. Copy `services/api/.env.example` → `.env`, set `SECRET_KEY`, optionally `RESEND_API_KEY`.
2. Optionally run API + `npm run dev:web` and verify register → login → profile → forgot/reset → change-password.
3. Start the next course milestone when the user provides it.

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
