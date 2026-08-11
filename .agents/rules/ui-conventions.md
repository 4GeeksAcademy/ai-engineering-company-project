# UI conventions

## Scope

`uis/website/**` and `uis/web/**`

## Rules

1. Prefer reusable React components with explicit TypeScript prop types.
2. Keep HealthCore visual identity: primary `#2563EB`, blue-600–900 scale, white / blue-50 surfaces, blue-900 footers. Do not default to purple-on-white or cream/terracotta AI themes.
3. Public site (`website`) and internal app (`web`) must use **distinct layouts** (different chrome, labelling, and entry experience).
4. Use `next/font` for purposeful typography (e.g. Source Sans 3 or IBM Plex Sans); avoid Inter/Roboto/Arial as the primary brand face.
5. Compose pages from section components; avoid dumping entire landing pages into a single untyped file.
6. Client interactivity (language toggle, modals, form validation, analytics buttons) belongs in `"use client"` components; keep server components where possible.
