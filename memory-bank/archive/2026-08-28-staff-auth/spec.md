# Spec — Staff auth (archived 2026-08-28)

## Requirements

1. Follow [`authentication_context.md`](authentication_context.md): TinyDB User/Profile, JWT bearer, `uis/web` localStorage token, Resend reset email.
2. `uis/website` stays fully public.
3. Auth lives in existing `services/api`, not a new app.

## Acceptance criteria

- [x] AUTH-01: TinyDB users/profiles, JWT login, `get_current_user`, protect suppliers + incidents.
- [x] AUTH-02: `uis/web` login/register/profile, AuthGuard, bearer `apiClient`.
- [x] AUTH-03: forgot/reset/change-password API + UI; Resend; single-use TinyDB reset `jti`.

## Interfaces / expected behavior

| Surface | Expected behavior |
|---------|-------------------|
| `uis/website` | Public; no auth |
| `uis/web` | Public `/login`, `/register`, `/forgot-password`, `/reset-password`; protected welcome, `/operations`, `/incidents`, `/suppliers`, `/account/profile`, `/account/change-password` |
| `services/api` | Login is `POST /auth/login` (OAuth2 form, `username` = email). `GET /health` public. Sensitive routes require bearer JWT. |

## Validation

- API: `python3 -m unittest discover -s tests -v` from `services/api` — 20 tests OK (2026-08-28). Resend mocked.
- UI: `npm run typecheck` passed.
- Real Resend inbox delivery was not run (no `RESEND_API_KEY` in the implementation environment).
- Browser click-through of `uis/web` was not run; API TestClient and typecheck were used instead.
