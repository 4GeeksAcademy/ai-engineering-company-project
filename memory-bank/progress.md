# Progress — Active iteration

## Current state

No active feature iteration. Bullet-proof phase (AUTH-088, API-042, FE-019) is archived under [`archive/2026-09-04-bullet-proof/`](archive/2026-09-04-bullet-proof/).

## Completed (standing)

- AUTH-088 / API-042 / FE-019 test suites; results in [`TESTING.md`](../TESTING.md)
- Phase guide moved off repo root into that archive (2026-09-04)

## Validation results

Last measured 2026-09-04: full `uv run pytest` **80 passed**; selected backoffice modules **88%**; `npm test -w uis/web` **6 passed**; `npm run typecheck` passed.

## Blockers

None. Live Resend still needs a local `RESEND_API_KEY` for real inbox delivery.

## Next steps

Wait for the next requested change.

## Run commands (durable)

```bash
cd services/api
uv sync --group dev
uv run pytest
uv run pytest --cov=app.auth --cov-report=term-missing
uv run pytest --cov=app.routers.incidents --cov=app.routers.suppliers --cov=app.suppliers --cov-report=term-missing
uvicorn app.main:app --reload --port 8000

cd scripts
python3 -m unittest discover -s tests -v

npm run dev:web
npm run typecheck
npm test -w uis/web
```

Last updated: 2026-09-04
