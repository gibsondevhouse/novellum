---
part: part-002-location-and-lore-crud
status: complete
---

# Implementation Checklist

## Pre-Implementation

- [x] Read `dev-docs/data-model.md` §Location and §LoreEntry — confirm all fields
- [x] Read `src/modules/bible/services/location-repository.ts` and `lore-repository.ts` — confirm method signatures
- [x] Confirm how `relatedEntityIds` are resolved: raw ID array stored; display resolves names via store

## Post-Implementation

- [x] Location CRUD works end-to-end; no direct Dexie calls outside repository
- [x] Lore category filter works client-side (no DB re-query per filter)
- [x] `relatedEntityIds` multi-select shows readable entity names (not raw IDs) in the form
- [x] `pnpm run check` — zero errors
- [x] `pnpm run lint` — zero errors
- [x] Both `+page.svelte` files ≤150 lines (93, 124)
