---
part: part-003-draft-editor-shell
phase: phase-002-content-module-shells
stage: stage-003-module-shell-implementation
---

# Checklist — Draft Editor Shell

## Pre-Implementation

- [ ] `part-002-outliner-shell` is `complete`
- [ ] `db.scenes` table exists in Dexie schema with `projectId` and `content` fields
- [ ] `novellum-docs/docs/modules/editor.md` reviewed for panel layout requirements
- [ ] [Svelte 5 `$state` docs](https://svelte.dev/docs/svelte/$state) reviewed

## Post-Implementation

- [x] `src/routes/projects/[id]/editor/+page.ts` loads scenes from Dexie
- [x] `src/routes/projects/[id]/editor/+page.svelte` renders three-panel layout
- [x] Scene selection updates `activeSceneId` store
- [x] Empty state renders in editor area when no scenes exist
- [x] AI panel placeholder (`<aside class="ai-panel">`) renders in DOM
- [x] `src/lib/stores/editor.svelte.ts` store created (writable store — $state rune incompatible with ESLint parser for .svelte.ts)
- [x] `pnpm run check` exits with zero errors
- [x] `pnpm run lint` exits with zero errors
- [ ] Screenshot of editor shell layout added to `evidence/`
- [x] `impl.log.md` updated with completion entry
