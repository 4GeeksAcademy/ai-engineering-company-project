# Tech updates — Bullet-proof tests

## Python (`services/api`)

- `pytest` + `pytest-cov` in the `uv` `dev` group; `[tool.coverage.run]` source `app.auth`, omit `app/auth/seed.py`
- Auth tests split by endpoint (`test_register.py`, `test_login.py`, …); `conftest.py` resets auth DB
- Incident tests: export without token 401; whitespace-only CSV 400
- Supplier tests: create/get/list/filters/patch rate/status, skip unreadable docs, 401/404

## Frontend (`uis/web`)

- `jest` + `next/jest` + `jest-environment-jsdom`
- `src/lib/__tests__/apiClient.test.ts`
- Script: `npm test -w uis/web`

## Docs

- Root `TESTING.md`
- Phase guide moved from repo root into this archive
