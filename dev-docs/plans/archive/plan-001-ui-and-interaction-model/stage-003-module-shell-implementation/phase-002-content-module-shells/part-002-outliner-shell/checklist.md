---
part: part-002-outliner-shell
phase: phase-002-content-module-shells
stage: stage-003-module-shell-implementation
---

# Checklist — Outliner Shell

## Pre-Implementation

- [ ] `part-001-story-bible-shell` is `complete`
- [ ] `db.beats` table exists in Dexie schema with `projectId` and `order` fields
- [ ] `novellum-docs/docs/modules/outliner.md` reviewed for beat fields

## Post-Implementation

- [x] `src/routes/projects/[id]/outline/+page.ts` loads beats ordered by `order`
- [x] `src/routes/projects/[id]/outline/+page.svelte` renders heading and toolbar
- [x] Empty state renders when no beats exist
- [x] Beat list renders (read-only) when beats exist
- [x] "Add Beat" stub button renders
- [x] `pnpm run check` exits with zero errors
- [x] `pnpm run lint` exits with zero errors
- [ ] Screenshot of Outliner shell (empty and populated states) added to `evidence/`
- [x] `impl.log.md` updated with completion entry
