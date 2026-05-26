---
part: part-002-project-detail-layout
phase: phase-001-project-hub-shell
stage: stage-003-module-shell-implementation
---

# Checklist — Project Detail Layout

## Pre-Implementation

- [ ] `part-001-project-list-page` is `complete`
- [ ] `src/lib/db/db.ts` Dexie instance has `projects` table
- [ ] [SvelteKit `error` helper docs](https://svelte.dev/docs/kit/errors) reviewed

## Post-Implementation

- [x] `src/routes/projects/[id]/+layout.ts` created and returns `project` from Dexie
- [x] `src/routes/projects/[id]/+layout.svelte` renders project title + secondary nav
- [x] 404 error shown when navigating to a non-existent project ID
- [ ] Sidebar `projectId` prop is wired to `data.project.id`
- [x] Stub hub page `+page.svelte` renders project title and placeholder stats
- [x] `pnpm run check` exits with zero errors
- [x] `pnpm run lint` exits with zero errors
- [ ] Screenshots of project detail view and 404 state added to `evidence/`
- [x] `impl.log.md` updated with completion entry
