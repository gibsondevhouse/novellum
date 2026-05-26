---
title: CRUD Factory Implementation
slug: part-001-crud-factory-impl
part_number: 1
status: review
owner: Architect
assigned_to: Architect
phase: phase-001-create-crud-factory
started_at: 2026-04-16
completed_at: 2026-04-16
estimated_duration: 0.25d
---

## Objective

> Create `src/lib/factories/entity-crud-store.svelte.ts` — a generic Svelte 5 store factory that generates reactive CRUD state, getters, and actions for any entity type.

## Scope

**In scope:**

- Generic `createEntityCrudStore<T>()` function using `$state` runes
- State: `list`, `saving`, `error`
- Getters: `getList()`, `getSaving()`, `getError()`
- Actions: `initList()`, `submitCreate()`, `submitUpdate()`, `submitDelete()`
- Lite mode (no saving/error tracking) for simple entities like Relationship

**Out of scope:**

- Migrating bible-crud (Part 002)
- Non-bible stores

## Implementation Steps

1. Create `src/lib/factories/entity-crud-store.svelte.ts`
2. Define config interface:
   - `repository`: object with `create`, `update`, `remove` async functions
   - `entityName`: string for error messages
3. Implement factory returning typed getters and actions
4. All state must use `$state` rune for Svelte 5 reactivity
5. Error handling: catch repository errors, set `error` state, clear `saving`

## Files

**Create:**

- `src/lib/factories/entity-crud-store.svelte.ts`

**Update:**

- None

## Acceptance Criteria

- [ ] Factory compiles with zero type errors
- [ ] Factory uses `$state` rune (Svelte 5)
- [ ] Supports full mode (list + saving + error) and lite mode (list only)
- [ ] `pnpm check` passes
