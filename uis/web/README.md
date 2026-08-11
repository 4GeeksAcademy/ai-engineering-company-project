# HealthCore Digital — Web (internal)

Internal Next.js console (port **3001**) for operations analytics and patient-incident analysis. Course path: `uis/web/`.

## Run

From the repository root:

```bash
npm install
npm run dev:web
```

Open http://localhost:3001.

## Incident analysis (Phase 2)

1. Start the API on port 8000 (see [`services/api/README.md`](../../services/api/README.md)).
2. Optionally copy [`.env.example`](./.env.example) to `.env.local`.
3. Open http://localhost:3001/incidents and upload a HealthCore incident CSV (e.g. [`scripts/incidents-healthcore.csv`](../../scripts/incidents-healthcore.csv)).

The UI calls `POST /api/incidents/analyze` and `GET /api/incidents/results/export`. Patient IDs are never displayed.

## Typecheck

```bash
npm run typecheck -w uis/web
```
