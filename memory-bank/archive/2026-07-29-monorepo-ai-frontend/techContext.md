# Tech Context

## Stack

| Layer | Choice |
|-------|--------|
| Public UI | Next.js (App Router) + TypeScript + Tailwind — `uis/website` (port 3000) |
| Internal UI | Next.js (App Router) + TypeScript + Tailwind — `uis/backoffice` (port 3001) |
| Domain logic | TypeScript modules in `src/types/` and `src/utils/` |
| Monorepo | npm workspaces (`uis/website`, `uis/backoffice`) |
| Agent docs | `memory-bank/`, `AGENTS.md`, `.agents/rules/`, `skills/` |

## Repository map (relevant)

```text
memory-bank/          Persistent agent context
AGENTS.md             How agents must operate
.agents/rules/        Scoped development rules
skills/               Reusable agent skills
src/types/            Domain models + sample data
src/utils/            Collections, search, transforms, validations
uis/website/          Public Next.js app
uis/backoffice/       Internal Next.js app
uis/index.html        Milestone 1 archive (do not modify without instruction)
services/             Future APIs only
packages/shared/      Shared package stub (@repo/shared-types)
```

## Importing Milestone 2 logic (mandatory pattern)

Backoffice **imports** original modules — never copies them:

```ts
import { sampleClaims } from "@healthcore/types/sampleData";
import { calculateDenialRate } from "@healthcore/utils/transformations";
```

Path alias `@healthcore/*` → repo-root `src/*`, configured in `uis/backoffice/tsconfig.json` and Next.js `transpilePackages` / webpack alias as needed.

Relative equivalent from `uis/backoffice`: `../../src/...` (same depth as `uis/programming-fundamentals`).

## Brand tokens (website)

- Primary: `#2563EB` (blue-600)
- Surfaces: white, `blue-50`, footer `blue-900`
- Font: Source Sans 3 / IBM Plex Sans via `next/font`
- Avoid purple-on-white AI-default themes

## Commands

```bash
npm install                 # from repo root
npm run dev:website         # http://localhost:3000
npm run dev:backoffice      # http://localhost:3001
npm run typecheck
```
