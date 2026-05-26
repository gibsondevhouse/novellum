---
part: part-002-accept-reject-flow
phase: phase-002-suggestion-flow
stage: stage-004-ai-interaction-layer
---

# Checklist — Accept / Reject Flow

## Pre-Implementation

- [ ] `part-001-context-builder-integration` is `complete`
- [ ] `aiStore.suggestion` is populated by a live AI request
- [ ] `db.scenes.update()` verified to work in Dexie schema
- [ ] [Dexie `table.update()` docs](<https://dexie.org/docs/Table/Table.update()>) reviewed

## Post-Implementation

- [x] Accept button appends suggestion to `scene.content` in Dexie
- [x] Editor textarea re-renders updated content after Accept
- [x] Reject clears `aiStore.suggestion` — scene untouched
- [x] Regenerate fires a new AI request and replaces previous suggestion
- [x] `Escape` key triggers Reject
- [x] `Ctrl+Enter` / `Cmd+Enter` triggers Accept
- [x] No stale suggestion remains in `aiStore` after Accept or Reject
- [x] `pnpm run check` exits with zero errors
- [x] `pnpm run lint` exits with zero errors
- [ ] End-to-end demo: write scene → Ask AI → Accept → content updated in editor — screenshot added to `evidence/`
- [x] `impl.log.md` updated with completion entry
