# Authentication Phase Context

## Purpose

This document is the requirements handoff for the agent that will plan and implement the authentication phase of the existing company monorepo. It combines three sequential 4Geeks projects into one larger initiative while preserving each project as a separate section:

1. `AUTH-01`: backend authentication, users, profiles, and route protection.
2. `AUTH-02`: frontend authentication flows, profile management, and protected views.
3. `AUTH-03`: forgotten-password recovery and authenticated password changes.

This file provides context only. The next agent must inspect the repository and active `memory-bank/` files before creating a concrete implementation plan. Do not create a new repository or a separate authentication application.

## Authoritative sources

- [AUTH-01 — User Authentication API](https://github.com/4GeeksAcademy/ai-engineering-syllabus/blob/main/content/projects/ai-eng-user-authentication-api/README.md)
- [AUTH-02 — User Authentication Flows](https://github.com/4GeeksAcademy/ai-engineering-syllabus/blob/main/content/projects/ai-eng-user-authentication-flows/README.md)
- [AUTH-03 — Password Reset and Change](https://github.com/4GeeksAcademy/ai-engineering-syllabus/blob/main/content/projects/ai-eng-user-authentication-restore/README.md)

The requirements below are derived from these public READMEs. If a future version of a source conflicts with this file, the current course source and instructor direction take precedence.

## Cross-project architecture and fixed constraints

- Work in the student's existing fork of the company monorepo.
- The API is FastAPI.
- The authenticated frontend applications are the existing Next.js applications in the monorepo.
- The Milestone 1 public website must remain completely public and unaffected by authentication checks.
- Authentication is stateless JWT bearer authentication. Do not replace it with cookie- or server-session authentication.
- Store `User` and `Profile` in TinyDB only, including after Supabase is introduced.
- Do not create `User` or `Profile` tables in Supabase, PostgreSQL, or SQLModel.
- Other modules, including inventory/PostgreSQL data, reference the TinyDB user ID as `user_uuid`.
- Passwords must always be hashed with `libpass[bcrypt]`; never store or compare plaintext passwords.
- Use FastAPI `OAuth2PasswordBearer` and `python-jose` for access-token authentication.
- Frontend access tokens must be stored in `localStorage` as required by the assignment.
- Password-reset email delivery must use Resend or SendGrid.
- Secrets, signing keys, email API keys, and environment-specific values must never be hardcoded or committed.

## Section 1 — AUTH-01: Authentication API and Route Protection

### Objective

Secure the existing company API so routes that expose or modify sensitive data require a valid JWT. Add credential-only users, one-to-one user profiles, login, current-user resolution, ownership checks, and protected existing routes.

### Required dependencies and tooling

- Use `uv`, not `pip install` or Pipenv.
- Required packages:

  ```bash
  uv add "python-jose[cryptography]" "libpass[bcrypt]"
  ```

- Although the package is the maintained `libpass` fork, its compatible import is:

  ```python
  from passlib.hash import bcrypt
  ```

### TinyDB `User` model

Create a TinyDB `User` model with at least:

- `id`
- `email`
- `hashed_password`
- `is_active`
- `role`
- `created_at`

Rules:

- `User` contains credentials and account-level fields only.
- Do not store display name, phone, address, or other contact fields on `User`.
- `role` accepts only `admin`, `manager`, or `user`; enforce this with an enum or validator.
- New registrations through `POST /users` default to the `user` role.
- Never expose `hashed_password` in API responses.

### TinyDB `Profile` model

Create a TinyDB `Profile` linked one-to-one with `User` through `user_id`, with at least:

- `id`
- `user_id`
- `name`
- `phone`
- `address`

The linked profile owns display name and contact data. Deleting a user must also remove the linked profile.

### User service layer

Provide service functions for:

- Create user.
- Get user by ID.
- Get user by email.
- Update user.
- Delete user.

The implementation should follow the repository's established service, schema, and TinyDB conventions rather than placing persistence logic directly in route handlers.

### Required `/users` routes

- `POST /users`: public registration route. Hash the password before storage. Accept optional initial profile fields (`name`, `phone`, `address`) and create the linked profile in the same operation.
- `GET /users`: protected list-all route.
- `GET /users/{id}`: protected single-user route.
- `PUT /users/{id}`: protected credential update. A user may update their own permitted credential fields. Only an `admin` may update `role`.
- `DELETE /users/{id}`: protected deletion route. Remove the linked profile as part of deletion.

Authorization must distinguish identity from permission. Missing or invalid authentication yields `401`; attempts to access or update another user's credentials/profile without permission yield `403`.

### Required `/profiles` routes

- `GET /profiles/me`: protected; return the authenticated user's linked profile.
- `PUT /profiles/me`: protected; allow the profile owner to update `name`, `phone`, and `address`.

### Required `/auth` routes

- `POST /auth/login`: accept `email` and `password`, verify the password hash, and return a signed JWT access token.
- `GET /auth/me`: protected; return the current user's `email`, `role`, and linked `Profile` data.

The planner must reconcile the exact login request encoding and response schema with `OAuth2PasswordBearer`, FastAPI docs, and the frontend contract.

### JWT and current-user dependency

Create a reusable `get_current_user` dependency that:

1. Extracts `Authorization: Bearer <token>` using `OAuth2PasswordBearer`.
2. Decodes and validates the JWT with `python-jose`.
3. Reads the TinyDB user ID carried by the token.
4. Retrieves that user from TinyDB.
5. Rejects any missing, malformed, invalid, expired, or unresolvable token with `HTTPException(401)`.

Additional requirements:

- The JWT must contain the TinyDB user `id` at minimum.
- The JWT must expire after a configurable interval.
- Read token expiry from an environment variable such as `ACCESS_TOKEN_EXPIRE_MINUTES`.
- Read the signing secret from `.env`; never hardcode it.

### Existing routes that must be protected

- Protect all `/users` routes except `POST /users`.
- Protect `/auth/me` and both `/profiles/me` routes.
- Protect at least five existing sensitive monorepo API routes outside `/users` and `/auth`.
- Audit all existing API routes and protect every route that exposes or modifies sensitive data, not merely the minimum five.
- Preserve correct behavior for authenticated requests; adding the dependency must not regress the underlying endpoint.
- Apply ownership checks where a resource belongs to a user, using the authenticated TinyDB user ID and the module's `user_uuid` relationship.

Fine-grained permission enforcement for every role on every route is not required for this delivery, though the required admin-only role update must still be enforced.

### AUTH-01 validation and evaluation checklist

- Full user CRUD is reachable through the API.
- Every user has a one-to-one profile.
- Profile/contact data is not stored on `User`.
- Invalid roles are rejected; registration defaults to `user`.
- Passwords are hashed at creation and verified correctly at login.
- Plaintext passwords never enter TinyDB.
- Login returns a valid signed JWT.
- `get_current_user` resolves the correct user.
- Protected routes return `401` without a valid token.
- Cross-user credential/profile access returns `403`.
- Signing secret and expiry configuration come from environment variables.
- Routes use the required `/auth`, `/users`, and `/profiles` prefixes.
- At least five existing routes outside `/users` and `/auth` require authentication.
- TinyDB remains the only user/profile store.
- Protected existing routes work normally with a valid token.
- Manually verify in `/docs`: register, login, authorize with the token, call protected routes, and test missing, malformed, and expired tokens.

## Section 2 — AUTH-02: Frontend Authentication Flows

### Objective

Connect the existing Next.js applications to the secured API. Add login, registration, account profile management, logout, authenticated API requests, and client-side protection for every non-public application view requiring a session.

Do not build a separate authentication app.

### Required authentication views

#### `/login`

- Display an email and password form.
- Call `POST /auth/login` using the API's exact request contract.
- On success, store the access token in `localStorage` and redirect to the main authenticated view.
- On failure, show a clear error message.
- This page must later include the AUTH-03 “Forgot your password?” link to `/forgot-password`.

#### `/register`

- Display the registration fields required by `POST /users`, including optional initial `name`, `phone`, and `address` fields as appropriate for the UI.
- Show field-level validation errors on failure.
- On success, perform the required sequence:
  1. Call `POST /users`.
  2. Call `POST /auth/login` with the same credentials.
  3. Store the returned token in `localStorage`.
  4. Redirect to the main authenticated view.

### Required account view

#### `/account/profile`

- Call `GET /auth/me` with the bearer token.
- Display email from `User`.
- Display `name`, `phone`, and `address` from the linked `Profile`.
- Allow editing profile/contact fields through `PUT /profiles/me` with the bearer token.
- Do not attempt to update profile/contact data through a user credential endpoint.

### Route protection

- Inventory every view across the existing Next.js applications except the Milestone 1 public website.
- Identify which views require authentication and protect all of them.
- Use a client-side layout guard or custom hook that can read `localStorage`.
- Redirect to `/login` when the token is absent or invalid.
- Do not use Next.js middleware for a `localStorage` token check; middleware runs on the server and cannot read browser storage.
- Do not add token checks or redirects to the public website.

Because the assignment requires invalid-token handling, the implementation plan must define how the client verifies more than mere token presence—for example, by calling `GET /auth/me` during protected-app initialization. Avoid rendering protected content before validation finishes.

### Token lifecycle and authenticated requests

- On successful login and registration, store the token in `localStorage`.
- For every protected API request, read the token and attach `Authorization: Bearer <token>`.
- Centralize bearer-header and `401` handling in the project's existing API client or a shared request utility when practical.
- On logout, remove the token and redirect to `/login`.
- When any protected API request returns `401`, remove the token and redirect to `/login`.
- Do not treat a `403` ownership/permission response as though the token were necessarily invalid.

### AUTH-02 validation and evaluation checklist

- Login works end to end and stores the token.
- Registration creates the user, logs in, stores the token, and redirects.
- Forms display the required error feedback.
- Protected views redirect when no valid token exists.
- Protected requests include the bearer token.
- The public Milestone 1 website remains entirely unaffected.
- `/account/profile` combines `User` email with linked `Profile` fields.
- Profile updates use `PUT /profiles/me`.
- Logout removes the token and redirects.
- Any protected API `401` clears the session and redirects.

## Section 3 — AUTH-03: Password Recovery and Change

### Objective

Add two distinct password mechanisms across the API and frontend:

1. Forgotten-password recovery using an emailed, short-lived, single-use reset token.
2. Authenticated password change requiring the current password.

This source project's repository slug says “restore,” but its actual assignment is password reset and password change. It is not a session-restoration assignment.

### Required email provider

Choose and integrate exactly one of:

- [Resend](https://resend.com/)
- [SendGrid](https://www.twilio.com/en-us/sendgrid)

The planning agent should select the provider deliberately, document the required environment variable in `README` or `.env.example`, and confirm the provider's current development-sender requirements. The API key must remain in environment configuration and out of source control.

### Required backend routes

#### `POST /auth/forgot-password`

Request:

```json
{ "email": "user@example.com" }
```

Behavior:

- Look up the user by email.
- If the user exists, generate a signed reset token that expires in 15–60 minutes.
- Build a frontend URL in the form `/reset-password?token=<token>`.
- Send a readable, mobile-friendly email containing the reset link through Resend or SendGrid.
- Always return `200`, including for unknown email addresses.
- Always present the same generic outcome to prevent account enumeration.

#### `POST /auth/reset-password`

Request:

```json
{ "token": "<reset-token>", "new_password": "<new-password>" }
```

Behavior:

- Validate token signature and expiration.
- Validate that the token has not already been used.
- Hash the new password with the same `libpass[bcrypt]` mechanism used elsewhere.
- Update the TinyDB user credential.
- Invalidate the token after the successful reset so it cannot be reused.
- Return `400` for an invalid, expired, or already-used token.

A JWT containing only an expiration claim is insufficient because it cannot be invalidated after use. Persist server-side reset state using a design compatible with TinyDB, such as a hashed-token record, a used-token record, or a `password_changed_at` strategy that rejects tokens issued before the last password change. The next agent must choose and document the exact mechanism.

#### `POST /auth/change-password`

Request:

```json
{ "current_password": "<current-password>", "new_password": "<new-password>" }
```

Behavior:

- Require a valid access token in the bearer authorization header.
- Resolve the user with `get_current_user`.
- Verify the submitted current password.
- Return `400` when the current password is wrong.
- Hash and persist the new password.

The implementation plan should decide whether a successful authenticated password change also invalidates outstanding reset tokens and/or previously issued access tokens. Those behaviors are security choices beyond the explicitly graded minimum and must not be assumed silently.

### Required frontend views

#### `/forgot-password`

- Display an email input.
- Call `POST /auth/forgot-password`.
- After submission, always show a generic confirmation such as: “If that address is registered, you'll receive a link shortly.”
- Disable the form after submission to prevent duplicate requests.

#### `/reset-password`

- Read the reset `token` from the URL query string.
- Display new-password and confirmation inputs.
- Validate that the values match before submitting.
- Call `POST /auth/reset-password` with the token and new password.
- On success, redirect to `/login` with a success message.
- On an invalid or expired token, show a clear error and a link to `/forgot-password`.

#### `/account/change-password`

- This is an authenticated account view.
- Display current password, new password, and confirmation inputs.
- Validate matching new password and confirmation before calling the API.
- Call `POST /auth/change-password` with the bearer token.
- Display clear success and error feedback.

#### Login-page integration

- Add a visible “Forgot your password?” link on `/login` pointing to `/forgot-password`.

### AUTH-03 security and evaluation checklist

- A registered address receives a real email containing the reset link.
- An unknown address still receives the same public `200` response and confirmation UX.
- Reset tokens expire within the configured 15–60 minute window.
- Reset tokens are single-use and invalid after a successful reset.
- Resetting updates the hashed TinyDB password.
- Invalid, expired, and already-used tokens return `400`.
- The reset page reads the query-string token and redirects to login after success.
- Invalid/expired reset UX links back to the forgot-password page.
- The login page links to forgot-password.
- Change-password validates confirmation on the client.
- Change-password requires authentication and verifies the current password on the server.
- Wrong current passwords return `400`.
- No email provider key or other secret appears in the codebase.

### Optional, non-evaluated extensions

Do not include these in the required scope unless the user approves them:

- Styled HTML email template beyond the required readable email.
- Rate limiting reset requests per email address.
- Password-reset audit logs with timestamp and IP address.

## Integrated end-to-end sequence

The completed phase should support these journeys:

### Registration and first login

1. User visits `/register`.
2. Frontend calls `POST /users`, optionally including initial profile fields.
3. API creates a hashed TinyDB `User` and linked TinyDB `Profile`.
4. Frontend calls `POST /auth/login` with the same credentials.
5. API returns a signed, expiring JWT carrying the TinyDB user ID.
6. Frontend stores the token in `localStorage` and enters the authenticated application.

### Authenticated usage

1. The protected Next.js application validates that a usable token exists.
2. Protected API calls send `Authorization: Bearer <token>`.
3. FastAPI's `get_current_user` validates the token and loads the TinyDB user.
4. Ownership checks compare the current user ID with the applicable `user_id`/`user_uuid`.
5. `401` clears the frontend token and redirects to login; `403` preserves the session and reports insufficient permission.

### Profile management

1. `/account/profile` loads `GET /auth/me`.
2. Email and role come from `User`; name and contact data come from `Profile`.
3. Profile edits go to `PUT /profiles/me`.

### Forgotten password

1. User follows the login-page link to `/forgot-password`.
2. The API always returns a generic `200` response.
3. For a real account, the provider sends a short-lived token link.
4. `/reset-password` reads the token and submits the new password.
5. The API validates signature, expiry, and unused state, changes the hash, and invalidates the token.
6. The frontend returns the user to `/login`.

### Authenticated password change

1. User visits protected `/account/change-password`.
2. Frontend validates password confirmation and submits current/new passwords with the access token.
3. API verifies the current password and stores the new hash.
4. UI displays success or the appropriate error.

## Combined definition of done

The authentication phase is complete only when:

- All AUTH-01, AUTH-02, and AUTH-03 evaluated requirements are implemented.
- `User` and `Profile` remain exclusively in TinyDB.
- User/profile field separation and one-to-one linkage are correct.
- Required routes and prefixes match the assignment.
- Access and reset tokens have the required validation and expiry behavior.
- Password reset tokens are provably single-use.
- At least five existing sensitive API routes outside `/users` and `/auth` are protected.
- All protected non-public Next.js views use client-compatible protection.
- The public Milestone 1 website has no authentication regression.
- Registration, login, profile edit, logout, forgot-password, reset-password, and change-password work end to end.
- Missing/invalid access tokens return `401`; authenticated ownership violations return `403`; bad reset/current-password requests return the required `400` responses.
- The selected email provider sends a real reset email in the development environment.
- Secrets are environment-based and documented with non-secret placeholders.
- Automated tests and manual FastAPI/browser checks cover success, failure, expiry, reuse, ownership, redirect, and regression paths.

## Instructions for the planning and implementation agent

1. Read `AGENTS.md` and the active `memory-bank/` files.
2. Inspect the monorepo's backend, all Next.js applications, TinyDB conventions, route organization, API client utilities, tests, environment examples, and current public/private view boundaries.
3. Create a route/view inventory before deciding what to protect.
4. Map each checkbox in this document to concrete files, dependencies, data changes, and verification steps.
5. Resolve the reset-token invalidation design explicitly; expiration alone does not satisfy AUTH-03.
6. Resolve the email provider and environment-variable contract explicitly.
7. Preserve existing user changes and avoid unrelated refactors.
8. Do not implement optional extensions without approval.
9. Validate each delivery end to end and record decisions/results in the project memory bank.
