---
name: pre-delivery-verification
description: >-
  Run HealthCore pre-commit delivery verification: confirm memory-bank context,
  protected paths untouched, typecheck for UI work, and Milestone 2 output
  visible in the web UI DOM. Use before every commit on this project.
---

# Pre-delivery verification

## Objective

Prevent unverified or context-blind changes from being committed. Agents must prove delivery criteria before commit so mistakes are cheap to catch.

## Inputs

| Input | Description |
|-------|-------------|
| `changed_paths` | List of files in the working tree / staged diff |
| `target` | One of: `website` \| `web` \| `docs-only` \| `mixed` |
| `session_reads` | Confirmation that required memory-bank files were read this session |
| `progress_notes` | Optional notes if milestone status should update |

## Procedure

1. Confirm `session_reads` covers `context.md`, `spec.md`, `progress.md`, and `decisions.md`.
2. Diff `changed_paths` against the protected list in `AGENTS.md`. Fail if any protected path is modified without explicit user instruction.
3. If `target` includes `website` or `web`, run from repo root: `npm run typecheck` (must exit 0).
4. If `target` is `web` (or mixed with web analytics):
   - Confirm operations UI imports from `@healthcore/*` or `../../src/...` (not local copies of `src` files).
   - Confirm at least one Milestone 2 export result is rendered in the DOM (panel/table/`<pre>`), not only `console.log`.
5. If deliverable status changed, update `memory-bank/progress.md` (and `decisions.md` if a material decision changed).
6. Only then allow commit **if the user requested a commit**.

## Acceptance criteria (must all pass)

| # | Criterion | How to verify |
|---|-----------|---------------|
| A | Required memory-bank files exist and were consulted | `context.md`, `spec.md`, `progress.md`, `decisions.md` present; agent affirms reads |
| B | No protected paths in the diff (unless user explicitly allowed) | `git diff` / status vs `AGENTS.md` protected table |
| C | UI typecheck passes when UI changed | `npm run typecheck` exit code 0 |
| D | Web analytics show logic in the UI | Manual or smoke check: operations page renders JSON/metrics from imported `src` utils |
| E | Progress updated when status moved | `memory-bank/progress.md` reflects current status and next step |

**If a criterion cannot be verified, it does not count as done — do not commit.**

## Checklist

See [examples/checklist.md](examples/checklist.md).
