# AI Engineering Company Project — HealthCore Digital

[![4Geeks Academy](https://img.shields.io/badge/4Geeks-Academy-blue)](https://4geeksacademy.com)
[![AI Engineering](https://img.shields.io/badge/track-AI%20Engineering-green)](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia)

_Base template for transversal projects in the AI Engineering Career Program — 4Geeks Academy. This fork is assigned to **HealthCore**._

> _Instrucciones disponibles en español en [README.es.md](./README.es.md)._

---

## Purpose

This repository is the working project for the HealthCore Digital unit. Deliverables map to course milestones (Web, Programming, Backend, Telemetry, RAG, Agents, Workflows, Real-time).

- Company context lives in [`CONTEXT.md`](./CONTEXT.md).
- Use `skills/`, `AGENTS.md`, `memory-bank/`, and directory-level `README.md` files as working guidance.

---

## Current status

HealthCore Digital scaffolding is in place for agent context and Next.js UIs.

- Company briefing: [`CONTEXT.md`](./CONTEXT.md)
- Agent context: `memory-bank/`, root `AGENTS.md`, `.agents/rules/`, `skills/pre-delivery-verification/`
- npm workspaces: `uis/website` (port 3000) and `uis/web` (port 3001)
- Backend blueprint: [`docs/architecture_proposal.md`](./docs/architecture_proposal.md)
- Phase 2 API: [`services/api/`](./services/api/) (incidents, suppliers, staff JWT auth on port 8000)
- Phase 1 incident CLI: [`scripts/analyze.py`](./scripts/analyze.py) + [`scripts/incidents-healthcore.csv`](./scripts/incidents-healthcore.csv)
- Shared package metadata: `packages/shared/package.json` (`@repo/shared-types`)
- Milestone 2 domain logic: `src/types/`, `src/utils/` (imported by `uis/web`; future API ownership)

---

## Repository structure

```text
ai-engineering-company-project/
├── README.md
├── README.es.md
├── CONTEXT.md                # Assigned company briefing (HealthCore)
├── AGENTS.md                 # How AI agents must operate in this repo
├── memory-bank/              # Active agent memory (context, spec, progress, decisions)
├── .agents/rules/            # Scoped agent rules
├── .cursor/rules/            # Cursor always-apply project rules
├── agents/                   # Agent patterns/templates and tools docs
├── data/                     # raw, process, pipelines, eval
├── docs/                     # Project and architecture documentation
├── infra/                    # Docker, Terraform, deployment configs
├── internal/                 # CLIs, packaged migration scripts, internal utilities
├── mcps/                     # Model Context Protocol (MCP) Servers
├── packages/
│   └── shared/               # Shared package (@repo/shared-types)
├── scripts/                  # Phase 1 analyze.py + incidents-healthcore.csv (+ helpers)
├── services/
│   └── api/                  # FastAPI incidents, suppliers, staff JWT auth
├── shared/                   # Shared assets/conventions at repo level
├── skills/                   # Reusable agent skills
├── src/                      # Milestone 2 domain types + utils (import only)
├── uis/                      # User interfaces
│   ├── website/              # Public Next.js site
│   ├── web/                  # Internal Next.js UI (upload + visualisation)
│   ├── programming-fundamentals/  # Milestone 2 browser demo
│   ├── index.html            # Milestone 1 archive
│   ├── application.html
│   └── validation.js
└── workflows/                # Automation/orchestration documentation
```

Course submission layout (incident analyzer):

```text
scripts/
├── analyze.py
└── incidents-healthcore.csv
services/
└── api/
uis/
└── web/
```

PR should include screenshots of (1) script console output on the 100-row CSV and (2) the web UI with analysis loaded.

---

## How to start

1. **Clone** this repository (or open it in Codespaces).
2. **Read** [`CONTEXT.md`](./CONTEXT.md) and [`AGENTS.md`](./AGENTS.md).
3. **Review** each top-level folder `README.md` (`uis/`, `services/`, `docs/`, `skills/`, etc.).
4. **Install and run** UIs from the repo root:

```bash
npm install
npm run dev:website      # http://localhost:3000
npm run dev:web          # http://localhost:3001
npm run typecheck
```

5. **Phase 1 CLI:**

```bash
cd scripts
python3 analyze.py incidents-healthcore.csv --no-export
```

6. **Phase 2 API** (required for `uis/web`; sign in at http://localhost:3001/login):

```bash
cd services/api
cp .env.example .env    # then set SECRET_KEY; add RESEND_API_KEY for real reset email
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 -m app.auth.seed
uvicorn app.main:app --reload --port 8000
```

Optional: copy [`uis/web/.env.example`](./uis/web/.env.example) to `.env.local` if you need a non-default API URL. See [`services/api/README.md`](./services/api/README.md) for auth routes and env vars.

7. **Continue milestones** in `uis/` and `services/`, reusing `packages/shared/` and `data/` as needed. Broader backend work should follow [`docs/architecture_proposal.md`](./docs/architecture_proposal.md).

---

## Milestones (reference)

| Milestone | Focus        | Typical deliverables                        |
| --------- | ------------ | ------------------------------------------- |
| 0         | Prework      | Environment setup, first prompts            |
| 1         | Web          | Corporate website, forms, SEO               |
| 2         | Programming  | Business logic, scoring, calculations       |
| 3         | AI-driven UI | AI-generated interfaces                     |
| 4         | Next.js      | Portals, loyalty app, operations UI         |
| 5         | Backend      | Central API (locations, menus, sales, etc.) |
| 6         | Telemetry    | Data pipeline, dashboards                   |
| 7         | RAG & Memory | Semantic knowledge base, search             |
| 8         | Agents       | Support, onboarding, training agents        |
| 9         | Workflows    | n8n automations                             |
| 10        | Real-time    | Live dashboards, alerts, streaming          |

---

## Links

- [4Geeks Academy — AI Engineering](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia)
- [How to start a coding project](https://4geeks.com/lesson/how-to-start-a-project)

---

## Contributors

This template was built as part of the 4Geeks Academy AI Engineering Career Program by [@marcogonzalo](https://www.linkedin.com/in/marcogonzalo) and [@alezanchezr](https://x.com/alesanchezr) and many other contributors. Find out more about our [AI Engineering Course](https://4geeksacademy.com/en/career-programs/ai-engineering), and [other courses](https://4geeksacademy.com/en/program-comparison).

You can find other templates and resources like this at the [4Geeks Academy GitHub page](https://github.com/4geeksacademy).

_This template is maintained by 4Geeks Academy for the AI Engineering track. For exclusive use in the programme._
