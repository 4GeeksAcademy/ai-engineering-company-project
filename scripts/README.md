# `scripts` folder

Helper scripts and the **Phase 1 incident analyzer** for HealthCore.

## Phase 1 — Incident analysis CLI

Course layout:

```text
scripts/
├── analyze.py                 # analysis script
├── incidents-healthcore.csv   # 100-row graded test file
├── CONTEXT-healthcore.md
├── src/                       # shared validation / summarize / export
└── tests/
```

```bash
cd scripts
python3 analyze.py incidents-healthcore.csv --no-export
python3 -m unittest discover -s tests -v
```

More detail: [INCIDENT-ANALYZER.md](INCIDENT-ANALYZER.md).

### PR screenshots (course)

1. Terminal/console output of analyzing the 100-row CSV with `analyze.py`.
2. Web UI (`uis/web` `/incidents`) with a loaded analysis visible (API must be running).

## Other

[`PlayGroundAPISchema.ts`](PlayGroundAPISchema.ts) — unrelated playground schema (pre-existing).

> _Spanish version: [README.es.md](./README.es.md)._
