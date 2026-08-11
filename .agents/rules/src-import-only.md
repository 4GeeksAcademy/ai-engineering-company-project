# Source import-only rule

## Scope

`src/**`

## Rules

1. Milestone 2 business logic in `src/types/**` and `src/utils/**` is the single source of truth.
2. UI apps (`uis/web`, `uis/website`, demos) must **import** these modules. Do not copy formulas, types, or sample data into app folders.
3. Do not edit thresholds, validators, or transforms unless the user explicitly requests a logic change.
4. Prefer path alias `@healthcore/*` or relative `../../src/...` imports from `uis/web`.
5. If a type is needed for UI props, import from `src/types/models.ts` rather than redefining interfaces.
