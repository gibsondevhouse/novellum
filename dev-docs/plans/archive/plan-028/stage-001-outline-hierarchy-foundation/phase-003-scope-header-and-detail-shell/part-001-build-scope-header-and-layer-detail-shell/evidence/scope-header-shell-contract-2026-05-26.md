# Scope Header + Layer Detail Shell Contract (2026-05-26)

## Shared Shell Behavior

- `WorkspaceShell` now supports a dedicated `mainHeader` snippet region rendered above main detail content.
- Main detail content is wrapped in a scrollable `workspace-shell__main-content` container while preserving split-shell layout.

## Scope Header Behavior

- `OutlineSummaryBar` now renders:
  - current layer label
  - active path summary (`Arc / Act / ...`)
  - readiness badge (`empty`, `partial`, `ready`)
- Stage action region is conditionally rendered only when `showStageActions` is true.

## Action Gating Rule

- Outline page computes:
  - `const showStageActionRegion = $derived(Boolean(selectedStage));`
- `OutlineSummaryBar` receives this flag and shows the stage run action only for valid Stage selection.
- Non-stage layers do not render the stage action region.

## Layer Detail Shell Coverage

Outline detail pane now has explicit layer-aware rendering for:

- Arc
- Act
- Milestone
- Chapter
- Scene
- Beat
- Stage

Each layer includes stale-selection fallback copy when a selected ID no longer resolves to a row.

## Test Artifact

`tests/outline/pipeline-scope-header-shell.test.ts` locks source-level contracts for:

- header and readiness rendering
- stage action gating
- `WorkspaceShell` mainHeader support
- outline page wiring through shared header slot
