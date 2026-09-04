# Spec — Active iteration

## Requirements

1. Memory bank follows global layout: `context.md`, `spec.md`, `progress.md`, `decisions.md`, and `archive/YYYY-MM-DD-name/` (with `implementation-plan.md` and `tech-updates.md` when archiving).
2. Root memory files stay limited to the **active** iteration plus standing facts. Completed work lives under `archive/`. Do not read `archive/` unless the user asks.
3. Agents update `progress.md` (and `decisions.md` when material) after milestones, scope changes, validation, blockers, or handoffs.
4. Delivery gates: scoped `.agents/rules/`, `skills/pre-delivery-verification` before UI/agent-doc commits, protected paths untouched without instruction.
5. Backend expansion follows [`docs/architecture_proposal.md`](../docs/architecture_proposal.md) (modular monolith under `services/healthcore-api`, region-split residency, API owns analytics).
6. **Testing and edge cases:** implementation and validation are one task. Add or update focused tests for new/changed behavior and bug fixes; prefer public interfaces; cover realistic edge cases; run the narrowest relevant checks first. Do not weaken tests to make code pass. If a check cannot be run, state the limitation and what remains unverified. Docs-only changes need no runtime tests.
7. Shipped auth stays as documented in standing behavior below (TinyDB User/Profile, JWT bearer, `uis/web` localStorage, Resend reset). `uis/website` stays fully public. The AUTH course contract is archived — do not load it unless asked.
8. Error-handling is archived — do not load it unless asked. User-facing errors remain sanitized (no raw `detail`, stacks, or status codes in the UI).
9. Bullet-proof test coverage is archived — do not load it unless asked. Run commands remain in [`TESTING.md`](../TESTING.md).

## Acceptance criteria

- [x] Required memory-bank files exist at `memory-bank/` root.
- [x] Completed iterations archived: `2026-07-29-monorepo-ai-frontend`, `2026-08-28-supplier-directory`, `2026-08-28-staff-auth`, `2026-08-31-error-handling`, `2026-09-04-bullet-proof`.
- [x] Project `AGENTS.md` points at the global memory-bank file names.
- [x] AUTH-088 / API-042 / FE-019 implemented; results in [`TESTING.md`](../TESTING.md).
- [x] `BulletProofApp-Context.md` moved to `memory-bank/archive/2026-09-04-bullet-proof/`.

## Interfaces / expected behavior (standing)

| Surface | Expected behavior |
|---------|-------------------|
| `uis/website` | Public corporate site; EN/ES; enquiry form; brand blues; no auth |
| `uis/web` | Public `/login`, `/register`, `/forgot-password`, `/reset-password`; protected welcome, `/operations`, `/incidents`, `/suppliers`, `/account/profile`, `/account/change-password` |
| `scripts/` | Phase 1 `analyze.py` + `incidents-healthcore.csv` |
| `services/api` | Incidents + suppliers (TinyDB) + staff auth. Login is `POST /auth/login` (OAuth2 form, `username` = email). `GET /health` public. Sensitive routes require bearer JWT. |
| Future `services/healthcore-api` | FastAPI `/api/v1` domains; OpenAPI contract for frontends |
| Agents | Skill discovery before non-trivial work; smallest change that satisfies the ask; no secrets; no git publish unless asked |

## Validation

- Code changes: follow requirement 6; report tests added/updated, commands run, results, and unverified risks.
- API: `uv run pytest` from `services/api`. Auth coverage: `uv run pytest --cov=app.auth`. Backoffice coverage: `--cov=app.routers.incidents --cov=app.routers.suppliers --cov=app.suppliers`.
- UI: `npm run typecheck`. Frontend helpers: `npm test -w uis/web`.
- Docs-only: confirm memory files present and `AGENTS.md` links resolve. No runtime test required.
- Real Resend delivery requires a local `RESEND_API_KEY` (not in git).
