# HealthCore API (Phase 2)

FastAPI HTTP surface for patient incident CSV analysis. Reuses validation and
summarization from [`scripts/`](../../scripts/) — does not duplicate HealthCore field rules.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/incidents/analyze` | Upload CSV (`multipart/form-data`, field `file`); returns JSON summary |
| `GET` | `/api/incidents/results/export` | Download last analysis as metrics CSV |
| `GET` | `/health` | Liveness check |

PHI (`patient_id`) never appears in JSON, logs, or export.

## Run

```bash
cd services/api
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs  

CORS allows the web UI (`uis/web`) at http://localhost:3001.

## Test

```bash
cd services/api
source .venv/bin/activate
python -m unittest discover -s tests -v
```
