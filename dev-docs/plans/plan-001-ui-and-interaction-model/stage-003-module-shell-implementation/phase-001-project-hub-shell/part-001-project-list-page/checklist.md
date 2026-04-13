---
part: part-001-project-list-page
phase: phase-001-project-hub-shell
stage: stage-003-module-shell-implementation
---

# Checklist — Project List Page

## Pre-Implementation

- [ ] `stage-002-application-shell` is `complete`
- [ ] `src/lib/db/db.ts` Dexie instance exists with `projects` table in schema
- [ ] [Dexie.js docs](https://dexie.org/docs/Tutorial/Getting-started) reviewed
- [ ] [SvelteKit `load` function docs](https://svelte.dev/docs/kit/load) reviewed

## Post-Implementation

- [x] `src/routes/+page.ts` loads and returns `projects` from Dexie
- [x] `src/routes/+page.svelte` renders empty state when no projects exist
- [x] "New Project" button creates a Dexie record and navigates to the new project route
- [x] Project cards navigate to `/projects/{id}` on click
- [x] `src/lib/db/projects.ts` helper created and exported
- [x] All styles use CSS custom properties
- [x] `pnpm run check` exits with zero errors
- [x] `pnpm run lint` exits with zero errors
- [ ] Screenshot of project grid and empty state added to `evidence/`
- [x] `impl.log.md` updated with completion entry
