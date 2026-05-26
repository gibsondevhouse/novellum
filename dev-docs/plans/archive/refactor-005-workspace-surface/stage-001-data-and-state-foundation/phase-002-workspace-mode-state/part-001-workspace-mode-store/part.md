---
title: Workspace Mode Store
slug: part-001-workspace-mode-store
part_number: 1
status: draft
owner: frontend
assigned_to: frontend
phase: phase-002-workspace-mode-state
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

> Create a Svelte 5 runes-based reactive store that manages the active structural mode (Arcs / Acts / Chapters / Scenes) and remembers the selected item ID for each mode independently, so switching modes does not reset the user's position.

## Scope

**In scope:**

- `WorkspaceMode` type definition
- Workspace mode store with Svelte 5 `$state` runes
- Mode cycling functions (next, prev, set)
- Per-mode selection state
- Unit tests

**Out of scope:**

- URL persistence of mode (future enhancement)
- Any UI components

## Implementation Steps

1. Create `src/modules/workspace/stores/workspace-mode.svelte.ts`
2. Define `WorkspaceMode` type: `'arcs' | 'acts' | 'chapters' | 'scenes'`
3. Define mode order array: `['arcs', 'acts', 'chapters', 'scenes'] as const`
4. Implement reactive state:
   - `let activeMode: WorkspaceMode = $state('arcs')`
   - `let selectedIds: Record<WorkspaceMode, string | null> = $state({ arcs: null, acts: null, chapters: null, scenes: null })`
5. Export accessor functions:
   - `getActiveMode(): WorkspaceMode`
   - `getSelectedId(mode: WorkspaceMode): string | null`
   - `getActiveSelectedId(): string | null` (shortcut for current mode)
6. Export mutation functions:
   - `setMode(mode: WorkspaceMode): void`
   - `nextMode(): void` — advance to next mode (wraps Scenes→Arcs)
   - `prevMode(): void` — go to previous mode (wraps Arcs→Scenes)
   - `selectItem(mode: WorkspaceMode, id: string | null): void`
7. Export types from `src/modules/workspace/types.ts`
8. Update `src/modules/workspace/index.ts` barrel to export store and types
9. Write tests in `src/modules/workspace/stores/__tests__/workspace-mode.test.ts`

## Files

**Create:**

- `src/modules/workspace/stores/workspace-mode.svelte.ts`
- `src/modules/workspace/types.ts`
- `src/modules/workspace/stores/__tests__/workspace-mode.test.ts`

**Update:**

- `src/modules/workspace/index.ts` — add exports for store and types

## Acceptance Criteria

- [ ] `WorkspaceMode` type is exported from workspace module
- [ ] Mode store tracks `activeMode` defaulting to `'arcs'`
- [ ] `nextMode()` cycles Arcs→Acts→Chapters→Scenes→Arcs
- [ ] `prevMode()` cycles in reverse with wrapping
- [ ] `selectItem('chapters', 'abc')` sets only the chapters selection
- [ ] Switching modes and back preserves the previously selected ID
- [ ] `getActiveSelectedId()` returns the selected ID for the current active mode
- [ ] Tests cover mode cycling, selection persistence, and wrapping behavior

## Edge Cases

- Calling `nextMode()` from Scenes should wrap to Arcs
- Calling `prevMode()` from Arcs should wrap to Scenes
- `selectItem` with `null` clears the selection for that mode
- Initial state has no selections (all null)

## Notes

> This store is separate from the existing outliner store (`outliner.svelte.ts`). Both stores can coexist. The workspace mode store is the authoritative state source for the refactored workspace surface.
