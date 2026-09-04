# Spec — Bullet-proof test coverage (archived)

## Requirements

AUTH-088, API-042, and FE-019 as specified in [`BulletProofApp-Context.md`](BulletProofApp-Context.md).

## Acceptance criteria

- [x] AUTH-088: happy/edge/failure per auth endpoint; `uv run pytest` passes; `app.auth` coverage ≥70%; [`TESTING.md`](../../../TESTING.md) records results.
- [x] API-042: incidents and suppliers happy/edge/failure; selected-module coverage ≥60%.
- [x] FE-019: three `uis/web` helpers have Jest happy/failure tests; `npm test -w uis/web` passes.
- [x] `BulletProofApp-Context.md` moved into this archive folder (2026-09-04).
