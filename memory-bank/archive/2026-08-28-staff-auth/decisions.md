# Decisions — Staff auth (archived 2026-08-28)

Course contract: [`authentication_context.md`](../../../authentication_context.md).

## Adopted (this iteration)

| Decision | Rationale |
|----------|-----------|
| Auth lives in existing `services/api`, not a new app | Course requires the student monorepo FastAPI app |
| Course roles are `admin` \| `manager` \| `user`; `POST /users` always `user` | Course AUTH-01 enum |
| Login is `POST /auth/login` with `OAuth2PasswordRequestForm` (`username` = email) | Required for `OAuth2PasswordBearer` + `/docs` Authorize; not `/auth/token` |
| JWT `sub` is the TinyDB user id; token in `uis/web` `localStorage` | Course AUTH-01/02; no cookies/sessions |
| Users/profiles only in TinyDB `data/auth.json` | Course forbids User/Profile in Postgres/Supabase |
| Suppliers/incidents stay org-shared (no `user_uuid` on those records) | Ownership `403` applies to `/users/{id}` and profiles; those modules are not per-user |
| Password reset uses signed JWT (`sub`, `jti`, `exp`, `typ=reset`) plus TinyDB `password_resets` | Expiration alone cannot prove single-use |
| Email provider is **Resend** | AUTH-03 requires Resend or SendGrid; Resend chosen |
| Successful reset or change-password invalidates unused reset tokens; access JWTs stay valid until expiry | Avoids an access-token denylist in this phase |
| `uis/web` AuthGuard is client-side (`GET /auth/me`); no Next.js middleware | Middleware cannot read `localStorage` |
| `cryptography` pinned to `>=42,<45` | `python-jose[cryptography]` 45+ tried to compile from source on this Mac and failed without OpenSSL/pkg-config; 44.x has wheels |

## Rejected (this iteration)

| Alternative | Why rejected | Reopen when |
|-------------|--------------|-------------|
| Cookie / server-session auth | Course requires JWT bearer + `localStorage` | N/A |
| SendGrid for reset email | Resend selected | Provider change requested |
| Access-token revocation on password change | Needs `password_changed_at` (or denylist) on every request | If session kill-switch is required |
| Rate limits / HTML email / reset audit logs | AUTH-03 optional extras; not approved | User asks |

## Unverified at archive

- Real Resend inbox delivery depends on a local `RESEND_API_KEY` and a permitted from-address.
