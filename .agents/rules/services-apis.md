# Services / APIs rule

## Scope

`services/**` and any new API entrypoints

## Rules

1. All HTTP APIs and backend workers for this project are created under `services/`.
2. Do not create alternate API roots such as `uis/*/api-server`, `apps/api`, or ad-hoc Express folders outside `services/`.
3. Next.js Route Handlers inside `uis/*/app/api` are allowed only as thin BFF adapters; durable business APIs still belong under `services/` when introduced.
4. Client-side use of `src/` sample data in `uis/web` does **not** require inventing an API.
