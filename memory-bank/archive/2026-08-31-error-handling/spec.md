# Spec — Error handling (archived 2026-08-31)

## Requirements

1. Follow [`error-handling-context.md`](error-handling-context.md): predictable failures, plain-language UI errors with a next action, sanitized API bodies, CLI nonzero exit on critical failure.
2. Do not add unrelated features or refactors.
3. Implementation and validation are one task.

## Acceptance criteria

- [x] Required memory-bank files exist at `memory-bank/` root.
- [x] Error-handling implementation matches the course guide (`uis/web`, `services/api`, `scripts/`).
- [x] On completion, `error-handling-context.md` is stored in this archive folder and removed from repo root.

## Validation (recorded)

- `cd services/api && python3 -m unittest discover -s tests -v`: 29 tests OK (2026-08-28)
- `cd scripts && python3 -m unittest discover -s tests -v`: 20 tests OK
- `npm run typecheck`: passed
- Browser click-through: servers were started; agent did not drive the browser
