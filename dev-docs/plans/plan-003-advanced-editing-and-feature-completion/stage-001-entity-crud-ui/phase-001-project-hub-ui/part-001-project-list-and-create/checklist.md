---
part: part-001-project-list-and-create
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [x] Read `dev-docs/data-model.md` §Project — confirm all fields
- [x] Read `src/modules/project-hub/services/project-repository.ts` — confirm `getAll()` and `create()` method signatures
- [x] Read `src/lib/stores/active-project.ts` — confirm how to set active project ID
- [x] Read `dev-docs/modular-boundaries.md` §File Length Budgets — confirm 150-line hard limit for `+page.svelte`
- [x] Confirm route structure: `src/routes/(app)/projects/+page.svelte` fits within existing layout shell

## Post-Implementation

- [x] `/projects` route renders complete list with correct project titles from Dexie
- [x] Empty state shown when no projects exist
- [x] Create form with `title` required validation works end-to-end; new project appears in list after submit
- [x] Clicking a project card sets `activeProjectId` and navigates correctly
- [x] `pnpm run check` — zero TypeScript errors (attach output as evidence)
- [x] `pnpm run lint` — zero ESLint errors including `eslint-plugin-boundaries`
- [x] `+page.svelte` line count ≤150 (attach `wc -l` output as evidence)
