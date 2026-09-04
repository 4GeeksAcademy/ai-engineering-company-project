# Context — Bullet-proof test coverage (archived 2026-09-04)

## Goal

AUTH-088 plus optional API-042 / FE-019. Phase guide: [`BulletProofApp-Context.md`](BulletProofApp-Context.md).

## Scope

- AUTH-088, API-042, and FE-019 implemented (pytest + Jest + root [`TESTING.md`](../../../TESTING.md)).
- Shipped UIs: `uis/website` (public), `uis/web` (staff JWT).
- Phase 2 API: `services/api/` — incidents, suppliers, staff JWT auth.

## Constraints

- User/Profile stay in TinyDB only. APIs live under `services/`.
- No production PHI flows. Do not rewrite `memory-bank/archive/`.

## Relevant files

| Path | Role |
|------|------|
| `BulletProofApp-Context.md` | Phase guide (this archive) |
| `TESTING.md` (repo root) | Measured AUTH-088 / API-042 / FE-019 results |
| `services/api/tests/` | pytest auth, incidents, suppliers |
| `uis/web/src/lib/__tests__/` | FE-019 Jest |
