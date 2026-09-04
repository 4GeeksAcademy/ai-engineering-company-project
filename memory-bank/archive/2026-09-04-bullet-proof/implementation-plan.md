# Implementation plan — Bullet-proof tests (archived)

Completed 2026-09-04. Phase guide: [`BulletProofApp-Context.md`](BulletProofApp-Context.md).

## Delivered

- AUTH-088: per-endpoint pytest modules under `services/api/tests/`; 94% `app.auth` coverage
- API-042: incident and supplier happy/edge/failure cases; 88% on selected modules
- FE-019: Jest for token storage, `messageForStatus`, `toUserMessage` / `parseError`
- Root [`TESTING.md`](../../../TESTING.md) with commands and measured results

## Out of scope (intentional)

- Component/E2E tests of `ErrorBanner` or pages
- Jest for `uis/website` enquiry validation
- Production auth/incident/supplier redesign
