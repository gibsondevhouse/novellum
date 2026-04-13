---
part: part-002-chapter-editor-binding
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [ ] Read `evidence/editor-choice-2026-04-12.md` from part-001 — know which editor is in use and its change event API
- [ ] Read `src/modules/editor/stores/editor-store.ts` — understand existing shape before extending
- [ ] Confirm `SceneRepository.getById(id)` exists and is tested (plan-002)

## Post-Implementation

- [ ] Editor route loads and scene text pre-populates the editor
- [ ] `contentChange` events updating `editorStore.pendingText` — verify via Svelte DevTools or console log
- [ ] Navigating away and back shows last-persisted text (not stale in-memory draft)
- [ ] Scene title and chapter breadcrumb visible in editor header
- [ ] `pnpm run check` — zero errors
- [ ] `pnpm run lint` — zero errors
- [ ] Editor route `+page.svelte` ≤150 lines (attach `wc -l` output)
