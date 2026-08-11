# Project Brief — HealthCore Digital

## Purpose

Build the systems, workflows, and intelligent tools that let HealthCore operate as a modern outpatient healthcare provider — safe, efficient, and patient-centred — across 12 clinics in the US and UK.

You are part of **HealthCore Digital**, the internal unit created by Dr. Sandra Okonkwo (CEO) and led technically by James Osei (CTO).

## In scope (current programme)

| Milestone | Focus | Deliverable in this repo |
|-----------|--------|--------------------------|
| 1 | Web | Corporate public website (migrated to `uis/website`) |
| 2 | Programming | Business logic under `src/` (claims, no-shows, CME) |
| 3+ | Agent scaffolding | Memory bank, `AGENTS.md`, `.agents/`, skills |
| 4 | Next.js portals | `uis/website` (public) + `uis/backoffice` (internal) |

## Goals

- Persistent business + technical context so AI agents do not make expensive mistakes.
- Public website that preserves Milestone 1 content with reusable React components and TypeScript.
- Internal backoffice that **imports** (does not copy) Milestone 2 logic and shows results in the UI.
- APIs, when needed, live only under `services/`.

## Non-goals (this pass)

- New REST APIs under `services/` (folder reserved; no API required while logic is client-imported).
- Replacing EHR systems or handling real PHI in production.
- Rewriting Milestone 2 formulas in `src/` without an explicit request.
- Merging unrelated git branches unless asked.

## Success criteria

- Agents read the memory bank at session start and follow the delivery workflow in `AGENTS.md`.
- Website home route includes all Milestone 1 sections with HealthCore visual identity.
- Backoffice welcome + operations views render Milestone 2 analytics from imported `src/` modules.
