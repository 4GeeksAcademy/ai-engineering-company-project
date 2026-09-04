# Context — HealthCore Digital (active)

## Goal

No active feature iteration. Waiting for the next requested change.

## Scope (standing)

- Keep shipped UIs runnable: `uis/website` (public), `uis/web` (staff JWT).
- Phase 1 incident CLI: [`scripts/`](../scripts/).
- Phase 2 API: [`services/api/`](../services/api/) — incidents, suppliers, staff JWT auth.
- Treat [`docs/architecture_proposal.md`](../docs/architecture_proposal.md) as the blueprint before expanding beyond Phase 2.
- Do **not** invent production PHI flows or EHR integrations without explicit instruction.

## Constraints

- Company briefing: [`CONTEXT.md`](../CONTEXT.md) (do not edit without instruction).
- Milestone 1 static archives and Milestone 2 `src/types/**`, `src/utils/**` — import/reference only until instructed.
- APIs live only under `services/`.
- HIPAA (US) / UK GDPR apply to any patient-adjacent data handling.
- User/Profile stay in TinyDB only (`services/api/data/auth.json`). Do not add User/Profile tables in Postgres/Supabase.
- No commit/push/PR unless the user requests it.
- Treat implementation and validation as one task (see spec). Do not rewrite `memory-bank/archive/`.

## Essential background

HealthCore: 12 outpatient clinics (US + UK), ~200 staff, ~$28M revenue. Pain points already modeled: claim denials (~14%), no-shows (~22%), CME/licence tracking, fragmented systems.

Completed iterations (do not load unless asked): `archive/2026-07-29-monorepo-ai-frontend/`, `archive/2026-08-28-supplier-directory/`, `archive/2026-08-28-staff-auth/`, `archive/2026-08-31-error-handling/`, `archive/2026-09-04-bullet-proof/`.

Durable test-coverage facts: [`implementation-memory/bullet-proof-test-coverage.md`](implementation-memory/bullet-proof-test-coverage.md).

## Relevant files

| Path | Role |
|------|------|
| `CONTEXT.md` | Company briefing |
| `TESTING.md` | AUTH-088 / API-042 / FE-019 commands and measured coverage |
| `AGENTS.md` | Project agent operating rules |
| `memory-bank/*` | Active iteration memory |
| `docs/architecture_proposal.md` | Backend architecture decisions |
| `uis/website/` | Public Next.js site (no auth) |
| `uis/web/` | Internal Next.js UI (login + ops + incidents + suppliers) |
| `scripts/` | Phase 1 analyze.py + CSV + shared validation |
| `services/api/` | FastAPI: incidents + suppliers + TinyDB users/profiles + JWT |
| `src/types/`, `src/utils/` | Milestone 2 domain logic (legacy-to-API path) |
| `.agents/rules/` | Scoped path rules |
| `.cursor/rules/global-working-rules.mdc` | Always-on working rules, including testing |
| `skills/pre-delivery-verification/` | Pre-commit verification skill |
