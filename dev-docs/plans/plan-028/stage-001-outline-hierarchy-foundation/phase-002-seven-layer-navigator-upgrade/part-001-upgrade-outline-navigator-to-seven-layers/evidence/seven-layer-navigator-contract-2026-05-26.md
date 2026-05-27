# Seven-Layer Navigator Contract Notes (2026-05-26)

## Implemented Surface

- Navigator now renders seven explicit columns:
  - Arc
  - Act
  - Milestone
  - Chapter
  - Scene
  - Beat
  - Stage
- All columns are parent-scoped from the active `PipelineHierarchyPath`.
- Breadcrumb displays the active path and supports ancestor jump by layer.

## Scope and Guardrails

- Stage rows are never shown unless a beat is selected.
- Beat rows are never shown unless a scene is selected.
- Chapter rows are sourced from selected milestone `chapterIds` only.
- Empty columns render layer-aware guidance and next-step hints instead of blank panels.

## Supporting Runtime Changes

- `outline-store.svelte.ts` now exposes:
  - Arc/milestone/stage set/get wrappers
  - `getSelectionPath()` for canonical path consumption
  - `jumpToSelectionLayer(layer)` for breadcrumb ancestor jumps
- `HierarchyBreadcrumb.svelte` now supports callback crumbs (`onSelect`) in addition to link crumbs (`href`).

## Test Coverage Added

`tests/outline/pipeline-seven-layer-navigator.test.ts` verifies:

- Parent-scoped filtering across all seven layers
- Stage visibility guard (no selected beat => no stage list)
- Layer-aware empty-state hints when parents are missing
- Breadcrumb construction truncating at first undefined selection layer
