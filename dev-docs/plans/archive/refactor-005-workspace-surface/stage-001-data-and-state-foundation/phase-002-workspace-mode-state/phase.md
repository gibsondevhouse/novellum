---
title: Workspace Mode State
slug: phase-002-workspace-mode-state
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-001-data-and-state-foundation
parts:
  - part-001-workspace-mode-store
  - part-002-workspace-data-service
estimated_duration: 0.5d
---

## Goal

> Implement the reactive state management for workspace structural mode cycling and a unified data service that loads all four entity types for a project, enabling the hero zone and collection zone to render the correct entities based on the active mode.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Workspace Mode Store](part-001-workspace-mode-store/part.md) | `draft` | frontend | 0.25d |
| 002 | [Workspace Data Service](part-002-workspace-data-service/part.md) | `draft` | backend | 0.25d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] `WorkspaceMode` type (`'arcs' | 'acts' | 'chapters' | 'scenes'`) is exported from workspace module
- [ ] Mode store tracks: `activeMode`, `selectedArcId`, `selectedActId`, `selectedChapterId`, `selectedSceneId`
- [ ] Mode cycling functions: `nextMode()`, `prevMode()`, `setMode(mode)` rotate through the four modes
- [ ] Per-mode selection functions: `selectItem(mode, id)` sets the selected ID for that mode only
- [ ] Workspace data service fetches arcs, acts, chapters, scenes for a given projectId
- [ ] Tests cover mode cycling and selection persistence

## Notes

> The mode store is independent of the outliner store. The outliner store (`outliner.svelte.ts`) manages the old split-panel selection state. The new workspace mode store manages the hero/collection mode and per-mode selections. Both can coexist during transition.
