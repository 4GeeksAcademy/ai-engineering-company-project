# Spec — Active iteration

## Requirements

1. Memory bank follows global layout: `context.md`, `spec.md`, `progress.md`, `decisions.md`, and `archive/`.
2. Agents read those four active files before substantial planning or implementation; never read `archive/` unless the user asks.
3. Agents update `progress.md` (and `decisions.md` when material) after milestones, scope changes, validation, blockers, or handoffs.
4. Existing HealthCore delivery gates remain: scoped `.agents/rules/`, `skills/pre-delivery-verification` before UI/agent-doc commits, protected paths untouched without instruction.
5. Backend work, when started, must follow [`docs/architecture_proposal.md`](../docs/architecture_proposal.md) (modular monolith under `services/healthcore-api`, region-split residency, API owns analytics).

## Acceptance criteria

- [x] Required memory-bank files exist at repo root of `memory-bank/`.
- [x] Prior milestone-4 memory archived under `archive/2026-07-29-monorepo-ai-frontend/`.
- [x] Project `AGENTS.md` points at the global memory-bank file names and embeds global working-rule expectations.
- [x] Backend Phase 2 `services/api` shipped; full `healthcore-api` still pending user request.

## Interfaces / expected behavior

| Surface | Expected behavior |
|---------|-------------------|
| `uis/website` | Public corporate site; EN/ES; enquiry form; brand blues |
| `uis/web` | Welcome + `/operations` + `/incidents` + `/suppliers` directory |
| `scripts/` | Phase 1 `analyze.py` + `incidents-healthcore.csv` |
| `services/api` | Incidents analyze/export + suppliers TinyDB CRUD (`POST/GET /suppliers`, rate/status PATCH) |
| Future `services/healthcore-api` | FastAPI `/api/v1` domains; OpenAPI contract for frontends |
| Agents | Skill discovery before non-trivial work; smallest change that satisfies the ask; no secrets; no git publish unless asked |

## Validation

- UI changes: `npm run typecheck` (and skill checklist when committing).
- Docs-only: confirm memory files present and `AGENTS.md` links resolve.
