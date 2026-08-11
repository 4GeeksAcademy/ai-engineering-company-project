# HealthCore API

FastAPI surface for:

- Phase 2 incident CSV analysis (reuses `scripts/` validation)
- Milestone 09 supplier directory backed by **TinyDB** + **Pydantic**

## Supplier directory

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/suppliers` | Register a supplier (Pydantic-validated) |
| `GET` | `/suppliers` | List suppliers (`country`, `category`, `status` query filters) |
| `GET` | `/suppliers/{id}` | Get one supplier |
| `PATCH` | `/suppliers/{id}` | Partial update |
| `PATCH` | `/suppliers/{id}/rate` | Update monthly rate (sets `updated_at`) |
| `PATCH` | `/suppliers/{id}/status` | Activate or suspend (no deletes) |

### Seed TinyDB

```bash
cd services/api
uv sync
uv run seed
```

This loads the exact 15 suppliers from `Supplier-Directory_Context.md`.

## Incident endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/incidents/analyze` | Upload CSV; returns JSON summary |
| `GET` | `/api/incidents/results/export` | Download last analysis as metrics CSV |
| `GET` | `/health` | Liveness check |

## Run API

```bash
cd services/api
uv sync
uv run seed
uv run uvicorn app.main:app --reload --port 8000
```

Or with the existing venv:

```bash
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000 — Docs: http://localhost:8000/docs  
CORS allows the internal UI at http://localhost:3001.

## Test

```bash
cd services/api
uv run python -m unittest discover -s tests -v
```
