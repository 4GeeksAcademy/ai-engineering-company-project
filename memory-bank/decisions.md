# Decisions — Active iteration

Standing decisions that still constrain work. Completed-iteration snapshots: [`archive/2026-07-29-monorepo-ai-frontend/`](archive/2026-07-29-monorepo-ai-frontend/), [`archive/2026-08-28-supplier-directory/`](archive/2026-08-28-supplier-directory/), [`archive/2026-08-28-staff-auth/`](archive/2026-08-28-staff-auth/). Architecture rationale: [`docs/architecture_proposal.md`](../docs/architecture_proposal.md). AUTH course contract lives in the staff-auth archive (do not load unless asked).

## Adopted

| Decision | Rationale |
|----------|-----------|
| Project memory bank uses global layout (`context`, `spec`, `progress`, `decisions`, `archive/YYYY-MM-DD-name/` with plan + tech-updates) | Aligns with global working rules; keeps active files concise |
| Finished course contracts live in `archive/`, not repo root or the four active files | AUTH moved there after completion; same for `error-handling-context.md` when that phase is done |
| Active phase guides stay at repo root until the phase is complete | `error-handling-context.md` is the error-handling guide; keep it out of `memory-bank/` until done |
| User-facing API errors go through `toUserMessage` / status maps, never raw `detail` or `Error.message` | Course forbids stack traces, status codes, and parse errors in the UI |
| FastAPI unhandled exceptions return a fixed 500 JSON body; logs stay server-side | Prevents traceback/secret leaks to clients |
| Website enquiry form stays client-only (no new enquiry API) | Wiring persistence would be a new feature |
| Implementation and validation are one task (proportional tests, realistic edge cases, report unverified risks) | Cursor `.cursor/rules/global-working-rules.mdc`; docs-only work needs no runtime tests |
| Domain-driven **modular monolith** on **FastAPI** under `services/healthcore-api` | Fits six-person tech team; extraction seams later |
| Backend becomes owner of Milestone 2 analytics (port to Python; TS `src/` legacy after parity) | PHI-adjacent ops analytics; avoid dual formulas |
| Data residency by **separate US/UK deployments + DBs**, shared codebase | HIPAA / UK GDPR |
| Separate Next.js frontends call API via HTTPS JSON + bearer scopes | Two UIs; Next Route Handlers stay thin proxies |
| Company briefing lives at root `CONTEXT.md`; Milestone docs under `docs/` | Programme README structure |
| Incident analyzer CLI lives under `scripts/` | Course submission monorepo layout |
| Phase 2 HTTP surface is `services/api` with UI in `uis/web` | Course paths |
| Supplier directory uses TinyDB at `services/api/data/suppliers.json` + Pydantic v2 | Milestone 09; seed via `uv run seed` |
| Supplier UI lives in `uis/web` (not `uis/backoffice`) | Internal app is `uis/web` |
| Auth lives in existing `services/api`; users/profiles only in TinyDB `data/auth.json` | Course forbids User/Profile in Postgres/Supabase |
| Login is `POST /auth/login` (`username` = email); JWT `sub` is TinyDB user id; token in `localStorage` | Course AUTH-01/02 |
| Roles are `admin` \| `manager` \| `user`; `POST /users` always `user` | Course AUTH-01 enum |
| Password reset uses signed JWT + TinyDB `password_resets`; email via **Resend** | Single-use `jti`; AUTH-03 |
| `uis/web` AuthGuard is client-side (`GET /auth/me`) | Middleware cannot read `localStorage` |
| `cryptography` pinned to `>=42,<45` | 45+ failed to compile on this Mac without OpenSSL/pkg-config |

## Rejected (for now)

| Alternative | Why rejected | Reopen when |
|-------------|--------------|-------------|
| Microservices day one | Ops cost > benefit for current team | Proven scale/deploy split + owner |
| Node backend only to reuse TS `src/` | Future workers/agents not TS-native | Unlikely |
| Single global DB with `region` column | Easy to query across jurisdictions by mistake | Compliance exception for non-PHI only |
| GraphQL / gRPC / event bus initially | Premature complexity | Clear multi-client or async fan-out need |
| Cookie / server-session auth | Course requires JWT bearer + `localStorage` | N/A |
| SendGrid for reset email | Resend selected | Provider change requested |
| Access-token revocation on password change | Needs denylist or `password_changed_at` | If session kill-switch is required |
| Rate limits / HTML email / reset audit logs | AUTH-03 extras; not approved | User asks |

## Still provisional

- Exact OAuth scope matrix and first write endpoint ordering (proposal §10).
- TS→Python migration window (proposal suggests ~two sprints after analytics endpoints ship).
- Real Resend inbox delivery depends on a local `RESEND_API_KEY` and a permitted from-address.
