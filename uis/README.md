# `uis` folder

This folder contains **all the user interfaces** related to the company for the cross-functional AI Engineering project.

Each subfolder inside `uis/` must correspond to **one specific user interface** and include its own technical and functional documentation.

> _Spanish version: [README.es.md](./README.es.md)._

## Active apps (Next.js)

From the **repository root** (npm workspaces):

```bash
npm install
npm run dev:website      # http://localhost:3000 — public HealthCore site
npm run dev:web          # http://localhost:3001 — internal HealthCore Digital web UI
npm run typecheck
```

| App | Path | Purpose |
|-----|------|---------|
| Public website | [`website/`](website/) | Milestone 1 corporate site migrated to Next.js |
| Internal web | [`web/`](web/) | Operations analytics + Phase 2 incident upload/visualisation |

`uis/web` imports Milestone 2 domain logic via `@healthcore/*` → repo `src/` (import, do not copy). Incident analysis UI: `/incidents`.

## Milestone 1 archive (static)

Legacy static landing (kept for reference; prefer `website/`):

```bash
npx --yes serve uis -l 5500
```

Then open `http://localhost:5500`.

- [index.html](index.html) — original landing page
- [application.html](application.html) — patient enquiry form
- [validation.js](validation.js) — client-side validation

## Programming fundamentals demo

[`programming-fundamentals/`](programming-fundamentals/) — Milestone 2 browser demo. Prefer `uis/web` `/operations` for the Next.js integration of the same `src/` modules.
