---
part: part-001-character-crud
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [x] Read `dev-docs/data-model.md` §Character and §CharacterRelationship — confirm all fields
- [x] Read `src/modules/bible/services/character-repository.ts` — confirm all method signatures
- [x] Read `src/modules/bible/stores/bible-store.ts` — understand state shape; plan extensions
- [x] Read `dev-docs/modular-boundaries.md` §Rule 1 — confirm only `src/modules/bible/index.ts` exports are consumed by routes

## Post-Implementation

- [x] Character list loads all characters for the active project
- [x] Create/edit/delete all function correctly end-to-end
- [x] Relationship editor adds and removes relationships; changes persisted to Dexie
- [x] No direct Dexie calls in any `+page.svelte` or component file (all go through store/repository)
- [x] `pnpm run check` — zero errors
- [x] `pnpm run lint` — zero errors
- [x] Both `+page.svelte` files ≤150 lines (127, 125)
