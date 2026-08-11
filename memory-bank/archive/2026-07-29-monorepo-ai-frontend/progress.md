# Progress

## Status legend

- [x] Done
- [~] In progress
- [ ] Not started

## Milestones

- [x] Milestone 1 — Static corporate website (`uis/index.html`, enquiry form)
- [x] Milestone 2 — Programming fundamentals (`src/`, `uis/programming-fundamentals`)
- [x] Milestone 4 / Monorepo AI setup — memory bank, AGENTS.md, `.agents/`, skill, Next.js apps
  - [x] `memory-bank/` created
  - [x] `AGENTS.md`, `.agents/rules/`, `skills/pre-delivery-verification`
  - [x] `uis/website` Next.js migration of Milestone 1
  - [x] `uis/backoffice` welcome + import Milestone 2 into UI
- [x] Backend architecture proposal — [`docs/architecture_proposal.md`](../docs/architecture_proposal.md) (decision doc; no code yet)
- [ ] Backend APIs under `services/` (implementation after proposal acceptance)
- [ ] Later milestones (telemetry, RAG, agents runtime, workflows, real-time)

## Notes

- Branch for this work: `milestone-4`.
- Company context source: `CONTEXT-healthcore.md` (do not edit without instruction).
- Run: `npm run dev:website` (3000), `npm run dev:backoffice` (3001), `npm run typecheck`.
- Backend proposal argues FastAPI modular monolith under `services/healthcore-api`, with Milestone 2 analytics owned by the API (TS `src/` becomes legacy after parity).
- Last updated: 2026-07-31
