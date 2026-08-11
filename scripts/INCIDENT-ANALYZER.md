# HealthCore — Patient Incident Report Analyzer (Phase 1)

Local CSV analysis utility for Priya Nair (Patient Experience). Processes incident exports offline and prints aggregate metrics. **Never** prints, logs, or exports `patient_id` (HIPAA / UK GDPR).

Lives under **`scripts/`** per course monorepo layout. HTTP endpoints: [`services/api/`](../services/api/). Web UI: [`uis/web/`](../uis/web/).

## Context

See [CONTEXT-healthcore.md](CONTEXT-healthcore.md).

## Run

```bash
cd scripts
python3 analyze.py incidents-healthcore.csv
```

Non-interactive options:

```bash
python3 analyze.py incidents-healthcore.csv --no-export
python3 analyze.py incidents-healthcore.csv --export metrics.csv
```

## Platform integration (Phase 2)

1. Start API: see [`services/api/README.md`](../services/api/README.md) (port 8000).
2. Start web UI: `npm run dev:web` (port 3001).
3. Open http://localhost:3001/incidents and upload `incidents-healthcore.csv`.

## Test

```bash
cd scripts
python3 -m unittest discover -s tests -v
```

## Layout

```text
scripts/
├── CONTEXT-healthcore.md
├── INCIDENT-ANALYZER.md
├── analyze.py
├── requirements.txt
├── incidents-healthcore.csv
├── src/
└── tests/
```

## Compliance

- Process files only on a machine authorized for HealthCore data.
- Do not upload incident CSVs to external AI tools.
- Console and export outputs contain metrics only — never patient identifiers.
