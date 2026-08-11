# Progress — Active iteration

## Current state

Course submission layout applied: Phase 1 under `scripts/` (`analyze.py`, `incidents-healthcore.csv`), Phase 2 API under `services/api/`, upload UI under `uis/web/`. Ready for PR with console + web screenshots.

## Completed

- Milestone 1–4 prior deliverables (website, programming fundamentals, agent scaffolding)
- Incident analyzer CLI + Phase 2 API/UI integration
- Restructure to course paths: `scripts/` + `services/api/` + `uis/web/`

## Validation results

- CLI from `scripts/`: 100/94/6, avg 3.58; 17 unit tests OK
- `services/api`: 7 API tests OK (fixture path `scripts/`)
- `npm run typecheck` (website + web) OK
- Layout: `scripts/analyze.py`, `services/api/`, `uis/web/` present; `incidents-analysis/` and `uis/backoffice/` removed

## Blockers

- None. PR screenshots are manual.

## Next steps

1. Push branch and open PR; attach script console + web UI screenshots.
2. When requested: expand toward `services/healthcore-api` modular monolith.

## Run commands (durable)

```bash
npm install
npm run dev:website      # :3000
npm run dev:web          # :3001
npm run typecheck

cd scripts
python3 analyze.py incidents-healthcore.csv --no-export
python3 -m unittest discover -s tests -v

cd services/api && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
python -m unittest discover -s tests -v
```

Last updated: 2026-08-06
