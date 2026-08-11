# HealthCore Programming Fundamentals (Milestone 2)

This project implements TypeScript programming logic and data manipulation for:
- claims filtering/search and denial analytics
- appointment no-show analytics
- clinician CME compliance reporting
- business rule validation

## Run TypeScript Validation

From this folder:

```bash
npm install
npm run typecheck
```

## Build Browser Demo

Compile TypeScript entrypoint to browser JavaScript:

```bash
npm run build
```

Then open [index.html](index.html) in a static server. Example:

```bash
npx serve .
```

Equivalent direct command:

```bash
npx tsc --noEmit
```

## File Structure

```text
uis/programming-fundamentals/
├── index.html
├── main.ts
├── main.js
└── programming-fundamentals-context.md

src/
├── types/
│   └── models.ts
└── utils/
	├── collections.ts
	├── search.ts
	├── transformations.ts
	└── validations.ts
```
