---
part: part-001-chapter-scene-management
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [x] Read `dev-docs/data-model.md` §Chapter and §Scene — confirm all fields and ordering approach
- [x] Read `chapter-repository.ts` and `scene-repository.ts` — confirm `reorder()` method exists or plan to add it
- [x] Read `outliner-store.ts` — understand existing state; plan CRUD extensions
- [x] Evaluate drag-and-drop approach: check if `@neodrag/svelte` is already a dep; if not, note install step (`pnpm add @neodrag/svelte`)

## Post-Implementation

- [x] Chapter list renders in correct order; expand/collapse works
- [x] Scene list renders in correct order inside each chapter
- [x] Create/rename/delete for both chapters and scenes work end-to-end
- [x] Drag reorder for chapters persists to Dexie (verify by refreshing page)
- [x] Drag reorder for scenes within a chapter persists to Dexie
- [x] `pnpm run check` — zero errors (attach output)
- [x] `pnpm run lint` — zero errors
- [x] `+page.svelte` ≤150 lines (attach `wc -l` output)
