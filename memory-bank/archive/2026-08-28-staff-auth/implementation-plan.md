# Implementation plan — Staff auth (archived)

Completed 2026-08-28 on branch `auth_api`. Course contract remains at root [`authentication_context.md`](../../../authentication_context.md).

## Delivered

- TinyDB User/Profile + password-reset `jti` store under `services/api/app/auth/`
- JWT login `POST /auth/login` (OAuth2 form, `username` = email); `GET /auth/me`; `get_current_user` on sensitive routes
- Register, profile, forgot/reset, change-password API + `uis/web` public/protected App Router routes
- AuthGuard via `GET /auth/me`; bearer token in `localStorage`
- Seeder: `uv run seed-auth` / `python3 -m app.auth.seed`
- Unit tests with mocked Resend (20 tests OK)

## Validation

- `python3 -m unittest discover -s tests -v` in `services/api`: 20 tests OK
- `npm run typecheck` (website + `uis/web`) passed
- Live Resend and browser click-through were not run in the implementation environment
