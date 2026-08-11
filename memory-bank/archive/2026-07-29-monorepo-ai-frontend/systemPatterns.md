# System Patterns

## Components

- Prefer reusable React components with typed props (`Button`, `Section`, `Card`, layout shells).
- Page routes compose sections; they should not contain large inline markup dumps.
- Shared content (locations, i18n strings) lives in `lib/` data modules.

## Domain logic

- **Single source of truth:** `src/types/**` and `src/utils/**`.
- UI apps import those modules. Duplicating claim/appointment/CME formulas into a UI folder is forbidden.
- Do not change validation thresholds or transform formulas unless the user explicitly asks.

## APIs

- Any HTTP API or backend service is created under `services/`.
- Do not invent `uis/*/api-server` or ad-hoc API roots outside `services/`.
- Client-side use of sample data in backoffice does not require an API.

## Agent behaviour

- Read memory bank files listed in `AGENTS.md` before implementing.
- Apply scoped rules under `.agents/rules/` for the paths being edited.
- Run `skills/pre-delivery-verification` before committing UI or agent-scaffolding work.
- Update `memory-bank/progress.md` when milestone status changes.

## Protected archives

Milestone 1 static files (`uis/index.html`, `uis/application.html`, `uis/validation.js`) remain as reference. Improvements ship in `uis/website`, not by rewriting the archive unless instructed.
