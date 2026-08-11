# Proyecto de Compañía - Ingeniería de IA — HealthCore Digital

[![4Geeks Academy](https://img.shields.io/badge/4Geeks-Academy-blue)](https://4geeksacademy.com)
[![AI Engineering](https://img.shields.io/badge/track-AI%20Engineering-green)](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia)

_Plantilla base para proyectos transversales del Programa de Carrera en Ingeniería de IA — 4Geeks Academy. Este fork está asignado a **HealthCore**._

_Las instrucciones están [disponibles en inglés](./README.md)._

---

## Propósito

Este repositorio es el proyecto de trabajo de la unidad HealthCore Digital. Los entregables se corresponden con los hitos del curso (Web, Programación, Backend, Telemetría, RAG, Agentes, Workflows, Tiempo real).

- El contexto de la empresa está en [`CONTEXT.md`](./CONTEXT.md).
- Usa `skills/`, `AGENTS.md`, `memory-bank/` y los `README.md` por carpeta como guía de trabajo.

---

## Estado actual

El andamiaje de HealthCore Digital está en su sitio para el contexto de agentes y las UIs Next.js.

- Briefing de empresa: [`CONTEXT.md`](./CONTEXT.md)
- Contexto de agentes: `memory-bank/`, `AGENTS.md` en la raíz, `.agents/rules/`, `skills/pre-delivery-verification/`
- Workspaces npm: `uis/website` (puerto 3000) y `uis/web` (puerto 3001)
- Plano del backend: [`docs/architecture_proposal.md`](./docs/architecture_proposal.md)
- API Fase 2: [`services/api/`](./services/api/) (análisis/export de incidentes en el puerto 8000)
- CLI Fase 1: [`scripts/analyze.py`](./scripts/analyze.py) + [`scripts/incidents-healthcore.csv`](./scripts/incidents-healthcore.csv)
- Metadata del paquete compartido: `packages/shared/package.json` (`@repo/shared-types`)
- Lógica de dominio Milestone 2: `src/types/`, `src/utils/` (importada por `uis/web`; futura propiedad de la API)

---

## Estructura del repositorio

```text
ai-engineering-company-project/
├── README.md
├── README.es.md
├── CONTEXT.md                # Briefing de empresa asignada (HealthCore)
├── AGENTS.md                 # Cómo deben operar los agentes de IA en este repo
├── memory-bank/              # Memoria activa del agente (context, spec, progress, decisions)
├── .agents/rules/            # Reglas de agentes por alcance
├── .cursor/rules/            # Reglas Cursor always-apply del proyecto
├── agents/                   # Patrones/plantillas de agentes y documentación de tools
├── data/                     # raw, process, pipelines, eval
├── docs/                     # Documentación de proyecto y arquitectura
│   ├── architecture_proposal.md
│   ├── HealthCore-Landing-Page.md
│   └── Healthcore-web-development-CONTEXT.md
├── infra/                    # Docker, Terraform, configuraciones de despliegue
├── internal/                 # CLIs, scripts de migración empaquetados, utilidades internas
├── mcps/                     # Servidores Model Context Protocol (MCP)
├── packages/
│   └── shared/               # Paquete compartido (@repo/shared-types)
├── scripts/                  # Fase 1 analyze.py + incidents-healthcore.csv
├── services/
│   └── api/                  # FastAPI Fase 2 análisis/export de incidentes
├── shared/                   # Recursos/convenciones compartidas a nivel repo
├── skills/                   # Skills reutilizables para agentes
├── src/                      # Tipos y utils de dominio Milestone 2 (solo importar)
├── uis/                      # Interfaces de usuario
│   ├── website/              # Sitio público Next.js
│   ├── web/                  # UI interna Next.js (carga + visualización)
│   ├── programming-fundamentals/  # Demo Milestone 2 en navegador
│   ├── index.html            # Archivo Milestone 1
│   ├── application.html
│   └── validation.js
└── workflows/                # Documentación de automatizaciones/orquestación
```

---

## Cómo empezar

1. **Clona** este repositorio (o ábrelo en Codespaces).
2. **Lee** [`CONTEXT.md`](./CONTEXT.md) y [`AGENTS.md`](./AGENTS.md).
3. **Revisa** los `README.md` de cada carpeta raíz (`uis/`, `services/`, `docs/`, `skills/`, etc.).
4. **Instala y ejecuta** las UIs desde la raíz del repo:

```bash
npm install
npm run dev:website      # http://localhost:3000
npm run dev:web          # http://localhost:3001
npm run typecheck
```

5. **Continúa los hitos** en `uis/` y `services/`, reutilizando `packages/shared/` y `data/` según corresponda. El trabajo de backend debe seguir [`docs/architecture_proposal.md`](./docs/architecture_proposal.md).

---

## Hitos (referencia)

| Hito | Enfoque       | Entregables típicos                              |
| ---- | ------------- | ------------------------------------------------ |
| 0    | Prework       | Configuración del entorno, primeros prompts      |
| 1    | Web           | Sitio corporativo, formularios, SEO              |
| 2    | Programación  | Lógica de negocio, puntuación, cálculos          |
| 3    | UI con IA     | Interfaces generadas con IA                      |
| 4    | Next.js       | Portales, app de fidelización, UI de operaciones |
| 5    | Backend       | API central (ubicaciones, menús, ventas, etc.)   |
| 6    | Telemetría    | Pipeline de datos, dashboards                    |
| 7    | RAG y memoria | Base de conocimiento semántica, búsqueda         |
| 8    | Agentes       | Agentes de soporte, onboarding, formación        |
| 9    | Workflows     | Automatizaciones con n8n                         |
| 10   | Tiempo real   | Dashboards en vivo, alertas, streaming           |

---

## Enlaces

- [4Geeks Academy — Ingeniería de IA](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia)
- [Cómo empezar un proyecto de código](https://4geeks.com/lesson/how-to-start-a-project)

---

## Contribuidores

Esta plantilla fue creada como parte del Programa de Carrera de Ingeniería de IA de 4Geeks Academy por [@marcogonzalo](https://www.linkedin.com/in/marcogonzalo) y [@alezanchezr](https://x.com/alesanchezr), junto a otros muchos colaboradores. Descubre más sobre nuestro [Curso de Ingeniería de IA](https://4geeksacademy.com/es/programas-de-carrera/ingenieria-ia) y sobre [otros cursos](https://4geeksacademy.com/es/comparar-programas).

Puedes encontrar otras plantillas y recursos similares en la [página de GitHub de 4Geeks Academy](https://github.com/4geeksacademy).

_Esta plantilla la mantiene 4Geeks Academy para el track de Ingeniería de IA. Uso exclusivo del programa._
