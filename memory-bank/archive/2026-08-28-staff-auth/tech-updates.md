# Tech updates — Staff auth (archived)

- Auth module: `services/api/app/auth/` (models, db, security, service, email, seed, config)
- Storage: TinyDB `services/api/data/auth.json` (gitignored `data/`)
- Packages: `python-jose[cryptography]`, `libpass[bcrypt]`, `resend`; `cryptography` pinned `>=42,<45`
- Login: `POST /auth/login` via `OAuth2PasswordRequestForm`; bearer JWT; `sub` = TinyDB user id
- Reset: signed JWT (`typ=reset`, `jti`) + TinyDB `password_resets`; Resend for delivery
- UI: `uis/web` public `(public)` vs protected `(protected)` route groups; token in `localStorage`
- Seed: `uv run seed-auth` or `python3 -m app.auth.seed`
- API port 8000; web UI 3001 (`/login`)
