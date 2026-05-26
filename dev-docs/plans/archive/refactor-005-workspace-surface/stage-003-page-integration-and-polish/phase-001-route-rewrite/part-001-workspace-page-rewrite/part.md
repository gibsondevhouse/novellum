---
title: Workspace Page Rewrite
slug: part-001-workspace-page-rewrite
part_number: 1
status: draft
owner: frontend
assigned_to: frontend
phase: phase-001-route-rewrite
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Rewrite the workspace route's data loader (`+page.ts`) and page template (`+page.svelte`) to compose the new component architecture — loading all four structural entity types, initializing the mode store, and wiring the hero zone and collection zone into the two-zone vertical layout.

## Scope

**In scope:**

- Rewrite `src/routes/projects/[id]/workspace/+page.ts` to load arcs, acts, chapters, scenes, characters
- Rewrite `src/routes/projects/[id]/workspace/+page.svelte` to compose new components
- Wire mode store to hero and collection zones
- Wire CRUD operations (create, rename, delete) to repositories
- Preserve migration call on mount

**Out of scope:**

- Visual polish and scroll behavior (Part in Phase 002)
- New component creation (already done in Stage 002)

## Implementation Steps

1. Rewrite `src/routes/projects/[id]/workspace/+page.ts`:
   - Import `getWorkspaceData` from workspace data service
   - Import `getOrCreateStoryFrame` from story-structure-service
   - Return `{ projectId, storyFrame, ...workspaceData }` (arcs, acts, chapters, scenes, characters)
   - Keep `export const ssr = false`
2. Rewrite `src/routes/projects/[id]/workspace/+page.svelte`:
   - Import new components: `WorkspaceHeroShell`, `StructureModeSwitcher`, `WorkspaceHeroCard`, `WorkspaceCollectionPane`, `StructureCrudCard`, `CreateStructureCard`
   - Import mode store functions: `getActiveMode`, `nextMode`, `prevMode`, `selectItem`, `getActiveSelectedId`
   - Import repository functions for CRUD: `createArc`/`updateArc`/`removeArc`, `createAct`/`updateAct`/`removeAct`, `createChapter`/`updateChapter`/`removeChapter`, `createScene`/`updateScene`/`removeScene`
   - Initialize local reactive data arrays from loader: `let arcs = $state(data.arcs)`, etc.
   - Run migration on mount via `$effect`
   - Derive current mode items: `const modeItems = $derived(...)` based on `getActiveMode()`
   - Derive selected item for hero: `const heroItem = $derived(...)` based on `getActiveSelectedId()` and active mode
   - Derive hero-specific props: `sceneCount` for chapters, `povCharacterName` for scenes
   - Implement `handleCreate(mode)`: calls appropriate repository create, pushes to local array, selects new item
   - Implement `handleRename(mode, id, newTitle)`: calls appropriate repository update, updates local array
   - Implement `handleDelete(mode, id)`: calls appropriate repository remove, removes from local array, clears selection if deleted item was selected
   - Compose template:
     - `WorkspaceHeroShell` containing `StructureModeSwitcher` + `WorkspaceHeroCard`
     - `WorkspaceCollectionPane` containing `{#each}` over `modeItems` rendering `StructureCrudCard` + trailing `CreateStructureCard`
3. Remove old imports: `HierarchyNavigator`, `ActPlanningPanel`, `OutlineDetailCard`, outliner store functions
4. Keep `<svelte:head>` title

## Files

**Create:**

- None (all components created in Stage 002)

**Update:**

- `src/routes/projects/[id]/workspace/+page.ts` — full rewrite
- `src/routes/projects/[id]/workspace/+page.svelte` — full rewrite

## Acceptance Criteria

- [ ] `+page.ts` returns arcs, acts, chapters (with scenes), scenes, and characters
- [ ] `+page.svelte` composes hero zone + collection zone
- [ ] Mode store drives both hero rendering and collection rendering
- [ ] `handleCreate` creates an item and selects it in the hero
- [ ] `handleRename` updates the item title in both local state and database
- [ ] `handleDelete` removes the item and clears selection if it was active
- [ ] Migration still runs on mount
- [ ] Old split-panel imports are fully removed
- [ ] `<svelte:head>` title is preserved
- [ ] Lint and typecheck pass

## Edge Cases

- Creating the first item for a mode should auto-select it
- Deleting the currently selected item should clear the hero to empty state
- Deleting the last item for a mode should show the empty state
- Switching modes should show the persisted selection (or empty state if none)
- Chapter CRUD needs to handle `actId` assignment (default to first act or null)
- Scene CRUD needs `chapterId` — when creating in scenes mode, assign to the first chapter or handle gracefully

## Notes

> The page is the orchestration layer — it owns the local reactive data arrays and delegates to repositories for persistence. Components are presentation-only (props in, events out).
>
> For scene/chapter creation in modes view: creating a scene in scenes mode will need a chapterId. Initially, assign to the first available chapter. If no chapters exist, the scene creation should prompt or default. This edge case may warrant a simple "Select chapter" dropdown in the create flow — but keep it minimal for now.
>
> The `handleCreate` pattern: create in DB → get returned entity → push to local array → select. This avoids re-fetching the entire dataset.
