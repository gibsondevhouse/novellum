---
title: Migrate Bible CRUD Store
slug: part-002-migrate-bible-crud
part_number: 2
status: review
owner: Architect
assigned_to: Architect
phase: phase-001-create-crud-factory
started_at: 2026-04-16
completed_at: 2026-04-16
estimated_duration: 0.5d
---

## Objective

> Rewrite `src/modules/bible/stores/bible-crud.svelte.ts` to use the new `createEntityCrudStore` factory, reducing it from ~420 lines to ~60 lines while preserving all exported function names and behavior.

## Scope

**In scope:**

- Migrate 5 full CRUD entities: Character, Location, LoreEntry, PlotThread, TimelineEvent
- Migrate 1 lite entity: Relationship (no saving/error state)
- Preserve all exported getter and action function names
- Re-export factory-generated functions with original names

**Out of scope:**

- Changing component consumers
- Adding new entity operations

## Implementation Steps

1. Import `createEntityCrudStore` from `$lib/factories/entity-crud-store.svelte.js`
2. For each entity, create store instance:
   ```typescript
   const characterStore = createEntityCrudStore<Character>({
     repository: { create: createCharacter, update: updateCharacter, remove: removeCharacter },
     entityName: 'Character'
   });
   ```
3. Re-export with original function names:
   ```typescript
   export const getCharacters = characterStore.getList;
   export const getCharacterSaving = characterStore.getSaving;
   export const initCharacters = characterStore.initList;
   export const submitCreateCharacter = characterStore.submitCreate;
   // etc.
   ```
4. Repeat for all 6 entities
5. Run `pnpm check` after migration

## Files

**Create:**

- None

**Update:**

- `src/modules/bible/stores/bible-crud.svelte.ts`

## Acceptance Criteria

- [ ] `bible-crud.svelte.ts` reduced to ~60 lines
- [ ] All existing exported function names preserved
- [ ] All 6 entities work (Character, Relationship, Location, LoreEntry, PlotThread, TimelineEvent)
- [ ] `pnpm check` — 0 errors
- [ ] Browser test: bible pages all work (CRUD operations)
