# Tech updates — Supplier Directory (archived)

- Storage: TinyDB at `services/api/data/suppliers.json` (gitignored `data/`)
- Validation: Pydantic v2; USA→USD / UK→GBP enforced; no supplier deletes (suspend only)
- Seed: `uv run seed` from `services/api` (`pyproject.toml` script → `app.seed:main`)
- UI: `uis/web` `/suppliers` (not `uis/backoffice`)
- API port 8000; web UI 3001
