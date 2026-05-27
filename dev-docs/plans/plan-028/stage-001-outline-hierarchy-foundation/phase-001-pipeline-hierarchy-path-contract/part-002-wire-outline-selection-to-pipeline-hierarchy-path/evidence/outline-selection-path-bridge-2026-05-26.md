# Outline Selection -> Pipeline Hierarchy Path Bridge (2026-05-26)

## Scope

Part-002 wires outline selection APIs to the canonical project-scoped hierarchy store and invokes stale-path repair when outline hierarchy data changes.

## Bridged API Surface

- `setSelectedAct(id)` -> `hierarchyStore.selectAct(activeProjectId, id)`
- `setSelectedChapter(id)` -> `hierarchyStore.selectChapter(activeProjectId, id)`
- `setSelectedScene(id)` -> `hierarchyStore.selectScene(activeProjectId, id)`
- `setSelectedBeat(id)` -> `hierarchyStore.selectBeat(activeProjectId, id)`
- `getSelected*Id()` now reads from the canonical hierarchy path for the active project.

If no active project is set, writes no-op and reads return `undefined`/safe defaults.

## Repair Trigger

`/projects/[id]/outline/+page.svelte` now triggers:

- `repairSelectionPathForActiveProject({ arcs, acts, milestones, chapters, scenes, beats, stages })`

on reactive hierarchy dataset updates. `scenes` is sourced from the current chapter tree to keep repair aligned with UI-local edits.

## Behavioral Guarantees Verified by Tests

`tests/outline/outline-store-pipeline-path-bridge.test.ts` covers:

- safe no-op behavior with no active project
- canonical write-through from outline store to hierarchy store
- project-scoped isolation when switching active project
- stale selection repair diagnostics (`stale_node` on missing scene)

## Files

- `src/modules/outline/stores/outline-store.svelte.ts`
- `src/routes/projects/[id]/outline/+page.svelte`
- `tests/outline/outline-store-pipeline-path-bridge.test.ts`
