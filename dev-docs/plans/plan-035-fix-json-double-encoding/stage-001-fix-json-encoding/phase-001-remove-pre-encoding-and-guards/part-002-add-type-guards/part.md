---
title: Add Type Guards to Array Consumer Functions
slug: part-002-add-type-guards
part_number: 2
status: draft
owner: Planner Agent
phase: phase-001-remove-pre-encoding-and-guards
---

## Task

Add `Array.isArray()` type guards to 4 crash-prone functions that call `.join()` or `.slice().join()` on array fields. These guards protect against both null/undefined AND accidentally-stringified values.

## Changes Required

### 2a. `src/modules/world-building/narrative-locations.ts` — `joinCommaSeparated` (line 68)

```ts
// Before
export function joinCommaSeparated(values: string[] | undefined): string {
    return (values ?? []).join(', ');
}

// After
export function joinCommaSeparated(values: string[] | undefined): string {
    if (!Array.isArray(values)) return '';
    return values.join(', ');
}
```

**Protects:** `RealmForm` and all uses of this function for joining tags and IDs.

### 2b. `src/modules/world-building/components/IndividualsDossier.svelte` (~line 238)

```ts
// Before
selectedCharacter.aliases.join(', ')

// After
(Array.isArray(selectedCharacter.aliases) ? selectedCharacter.aliases : []).join(', ')
```

### 2c. `src/modules/world-building/components/LoreEntryDetailHeader.svelte` (line 71)

```ts
// Before
entry.tags.slice(0, 2).join(', ')

// After
(Array.isArray(entry.tags) ? entry.tags : []).slice(0, 2).join(', ')
```

### 2d. `src/lib/ai/prompt-builder.ts` (line 120)

```ts
// Before
c.traits.join(', ')

// After
(Array.isArray(c.traits) ? c.traits : []).join(', ')
```

## Acceptance Criteria

- [ ] All 4 functions guarded with `Array.isArray` checks
- [ ] No syntax errors
- [ ] TypeScript strict mode: no errors
- [ ] `pnpm lint` passes
- [ ] Manual test: Load a character created via GeneratedEntityModal in Individuals Dossier → no crash
- [ ] Manual test: Load a lore entry created via GeneratedEntityModal → no crash
- [ ] Unit test (if applicable): `joinCommaSeparated` returns `''` for string input
- [ ] Part marked `complete`

## Notes

- These guards are defensive and non-breaking
- Safe to implement in parallel with Part 1
- Can be deployed independently of Phase 2 & 3
- `RealmForm` is protected via `joinCommaSeparated` guard (doesn't need separate changes)
