# AGENTS.md — HealthCore Digital

Rules for any AI agent working in this repository.

This project follows the **Global Working Rules** (memory bank layout, skill discovery, context efficiency, scoped changes, safety, task completion). Project-specific constraints below take precedence when they are stricter.

## Session start — required reads (in order)

Before substantial planning or implementation, read:

1. [`memory-bank/context.md`](memory-bank/context.md)
2. [`memory-bank/spec.md`](memory-bank/spec.md)
3. [`memory-bank/progress.md`](memory-bank/progress.md)
4. [`memory-bank/decisions.md`](memory-bank/decisions.md)
5. Relevant scoped rules under [`.agents/rules/`](.agents/rules/) for the paths you will touch
6. [`docs/architecture_proposal.md`](docs/architecture_proposal.md) when changing backend layout or starting `services/`

Do **not** read `memory-bank/archive/` unless the user explicitly asks.

## Global working expectations (project-local)

- **Memory bank:** Keep only active-iteration facts in the four root memory files. Archive completed/superseded iterations under `memory-bank/archive/YYYY-MM-DD-name/` with plan and tech-update notes when appropriate. Update memory after material plans, decisions, milestones, validation, blockers, handoffs, or completion.
- **Skills:** Before non-trivial work, check whether an available skill applies; read full `SKILL.md` only when relevant. Use the smallest set needed. Do not install/create/modify skills without permission. Prefer [`skills/pre-delivery-verification`](skills/pre-delivery-verification/SKILL.md) before UI/agent-doc commits.
- **Context efficiency:** Inspect only task-relevant files; search before opening large files; prefer project docs over assumptions.
- **Scoped changes:** Smallest change that fully satisfies the request; no unrelated refactors; report unrelated problems without fixing unless they block the task.
- **Safety:** Never expose or commit secrets; do not commit, push, branch, or open PRs unless the user asks; avoid destructive commands.
- **Completion:** Confirm the ask was met; run proportional validation; never claim a check passed unless it was run; leave `progress.md` with status and next step after substantial work.

## Mandatory delivery workflow (before every commit)

Follow these steps **in order**. Do not skip.

1. **Confirm context** — Active memory-bank files above were read this session; apply matching `.agents/rules/` for edited paths.
2. **Implement in allowed paths only** — Leave protected paths untouched unless the user gave explicit instruction to change them.
3. **Verify** — Run [`skills/pre-delivery-verification`](skills/pre-delivery-verification/SKILL.md) when UI, agent scaffolding, or delivery-status docs change. Acceptance criteria must pass (typecheck for UI work; Milestone 2 output visible in the DOM for web analytics).
4. **Update progress** — Update [`memory-bank/progress.md`](memory-bank/progress.md); update [`memory-bank/decisions.md`](memory-bank/decisions.md) if a material decision changed.
5. **Commit** — Only after verification passes **and** the user requested a commit; use a clear message focused on why.

## Folders and files agents MUST NOT modify without explicit instruction

| Path | Reason |
|------|--------|
| `CONTEXT.md` | Canonical company briefing (HealthCore) |
| `src/types/**` | Milestone 2 domain models & sample data — **import only** until API ownership migration |
| `src/utils/**` | Milestone 2 business logic — **import only** until API ownership migration |
| `uis/index.html` | Milestone 1 archive |
| `uis/application.html` | Milestone 1 archive |
| `uis/validation.js` | Milestone 1 archive |
| `memory-bank/archive/**` | Historical iterations — do not rewrite |
| `.env`, `.env.*`, credentials files | Secrets |
| `.git/` | Version control internals |

## Where to put new work

| Kind of work | Location |
|--------------|----------|
| Public website | `uis/website/` |
| Internal web UI | `uis/web/` |
| Incident CLI / CSV analysis | `scripts/` |
| HTTP APIs | `services/` only |
| Agent rules | `.agents/rules/` |
| Agent skills | `skills/<skill-name>/` |
| Active persistent context | `memory-bank/{context,spec,progress,decisions}.md` |
| Completed iteration memory | `memory-bank/archive/` |

## Skill for recurring delivery checks

Use **`skills/pre-delivery-verification`** before every commit that changes UI, agent scaffolding, or docs that affect delivery status (when a commit is requested).

## Testing and Edge Cases

Treat implementation and validation as one task. Code changes are not complete until they have been tested in proportion to their risk.

After writing or modifying code:

- Identify the behavior affected and inspect the project’s existing testing patterns.
- Add or update focused tests for new behavior, changed behavior, and bug fixes. When fixing a bug, include a regression test that would have caught it.
- Test observable behavior and public interfaces rather than internal implementation details.
- Consider relevant edge cases, including empty or missing values, boundary values, malformed input, duplicate data, unexpected ordering, failure responses, timeouts, and partial operations. Also consider concurrency, permissions, security, accessibility, and platform differences when they apply.
- Prioritize realistic edge cases based on the feature’s requirements and likely failure modes. Do not add speculative tests for situations the system cannot encounter.
- Run the narrowest relevant tests first, followed by applicable type checks, lint checks, builds, integration tests, or smoke tests.
- Do not weaken, delete, skip, or rewrite a valid test merely to make the implementation pass. Change an existing test only when the intended behavior has genuinely changed.
- If a test fails, determine whether the failure was introduced by the current change or already existed. Fix failures caused by the current work. Report unrelated pre-existing failures without expanding the task unless they block validation.
- Never claim that tests passed unless they were actually run successfully.

Testing may be omitted for changes that cannot affect runtime behavior, such as comments or documentation. Briefly state why no test was necessary.

If testing cannot be performed because of missing dependencies, unavailable services, credentials, environment limitations, or excessive cost, explain the exact limitation and perform the best available alternative check. Clearly distinguish verified behavior from behavior that remains unverified.

Before finishing, report:

- tests added or updated;
- validation commands or checks performed;
- results and any remaining unverified risks.
