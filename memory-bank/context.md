# Context — HealthCore Digital (active)

## Goal

Operate HealthCore Digital’s monorepo so agents and engineers can safely extend the public website, internal web UI, and backend APIs without losing company or technical context.

## Scope (active)

- Maintain agent memory bank per global working rules (`context`, `spec`, `progress`, `decisions`, `archive/`).
- Keep shipped UIs runnable: `uis/website`, `uis/web`.
- Phase 1 incident CLI: [`scripts/`](../scripts/).
- Phase 2 API: [`services/api/`](../services/api/) (incidents + shipped supplier directory TinyDB).
- Auth API iteration: briefing pending (root `authentication_context.md` when provided).
- Treat [`docs/architecture_proposal.md`](../docs/architecture_proposal.md) as the blueprint before expanding beyond Phase 2.
- Do **not** invent production PHI flows or EHR integrations without explicit instruction.

## Constraints

- Company briefing: [`CONTEXT.md`](../CONTEXT.md) (do not edit without instruction).
- Milestone 1 static archives: `uis/index.html`, `uis/application.html`, `uis/validation.js` — reference only.
- Milestone 2 TS under `src/types/**` and `src/utils/**` — import only until API owns analytics (see decisions).
- APIs live only under `services/`.
- HIPAA (US) / UK GDPR apply to any patient-adjacent data handling.
- No commit/push/PR unless the user requests it.

## Essential background

HealthCore: 12 outpatient clinics (US + UK), ~200 staff, ~$28M revenue. Pain points already modeled: claim denials (~14%), no-shows (~22%), CME/licence tracking, fragmented systems.

## Relevant files

| Path | Role |
|------|------|
| `CONTEXT.md` | Company briefing |
| `AGENTS.md` | Project agent operating rules |
| `memory-bank/*` | Active iteration memory |
| `docs/architecture_proposal.md` | Backend architecture decisions |
| `uis/website/` | Public Next.js site |
| `uis/web/` | Internal Next.js UI (ops + incidents + suppliers) |
| `scripts/` | Phase 1 analyze.py + CSV + shared validation |
| `services/api/` | FastAPI: incidents + suppliers (TinyDB) |
| `src/types/`, `src/utils/` | Milestone 2 domain logic (legacy-to-API path) |
| `.agents/rules/` | Scoped path rules |
| `skills/pre-delivery-verification/` | Pre-commit verification skill |
