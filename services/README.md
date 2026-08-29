# `services` folder

This folder contains **all the backend services** (APIs and background workers) related to the company for the cross-functional AI Engineering project.

Each subfolder inside `services/` must correspond to **one specific service** and include its own technical and functional documentation.

> _Spanish version: [README.es.md](./README.es.md)._

## Active services

| Service | Path | Purpose |
|---------|------|---------|
| HealthCore API (Phase 2) | [`api/`](api/) | FastAPI incidents, supplier directory, and staff JWT auth; reuses [`scripts/`](../scripts/) |

```bash
cd services/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The full modular monolith described in [`docs/architecture_proposal.md`](../docs/architecture_proposal.md) (`healthcore-api`) is still future work; `api/` is the first HTTP surface.

## Related CLI (not a service)

Phase 1 analyzer CLI: [`scripts/analyze.py`](../scripts/analyze.py). The API imports `scripts/src/` rather than copying rules.
