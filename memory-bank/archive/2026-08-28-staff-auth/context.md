# Context — Staff auth (AUTH-01/02/03, archived 2026-08-28)

Course contract (unchanged at repo root): [`authentication_context.md`](../../../authentication_context.md).

## Goal

Implement AUTH-01, AUTH-02, and AUTH-03 in the existing HealthCore monorepo: TinyDB users/profiles, JWT bearer on `services/api`, login/register/profile in `uis/web`, and Resend password reset. Do not create a separate auth app. Keep `uis/website` fully public.

## Scope (this iteration)

- AUTH-01: TinyDB `User`/`Profile`, JWT `POST /auth/login`, `get_current_user`, protect suppliers + incidents, `uv run seed-auth`.
- AUTH-02: `uis/web` login/register/profile, AuthGuard (`GET /auth/me`), `localStorage` bearer client.
- AUTH-03: Resend forgot-password, single-use TinyDB reset `jti`, change-password UI + API.

## Constraints

- User/Profile stay in TinyDB only (`services/api/data/auth.json`). No User/Profile tables in Postgres/Supabase.
- JWT bearer + `localStorage`; no cookies/sessions.
- Passwords hashed with `libpass[bcrypt]`; never store or compare plaintext.
- Secrets never hardcoded or committed.

## Essential background

HealthCore: 12 outpatient clinics (US + UK). Phase 2 API already had incidents + supplier directory. Auth was added to that app, not a new service.

## Relevant files (at archive time)

| Path | Role |
|------|------|
| `authentication_context.md` | AUTH-01/02/03 course contract |
| `services/api/app/auth/` | FastAPI auth module |
| `uis/web/src/app/(public)/` | login, register, forgot/reset |
| `uis/web/src/app/(protected)/` | welcome, ops, incidents, suppliers, profile, change-password |
