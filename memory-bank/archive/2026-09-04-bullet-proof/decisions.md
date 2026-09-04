# Decisions — Bullet-proof test coverage (archived)

| Decision | Rationale |
|----------|-----------|
| AUTH-088 uses pytest + pytest-cov via `uv`; coverage on `app.auth`, omit `seed.py` | Course requires `uv run pytest --cov` |
| AUTH-088 skips Jest for auth crypto; FE-019 tests `apiClient` helpers | `authApi.ts` is fetch-only |
| API-042 extends existing unittest files | Smallest change; pytest collects TestCase |
| FE-019 Jest only in `uis/web` via `next/jest` | Path aliases; website enquiry validator out of scope |
