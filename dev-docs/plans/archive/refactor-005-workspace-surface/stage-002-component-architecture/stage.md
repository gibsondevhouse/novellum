---
title: Component Architecture
slug: stage-002-component-architecture
stage_number: 2
status: draft
owner: Planner Agent
plan: refactor-005-workspace-surface
phases:
  - phase-001-hero-zone
  - phase-002-collection-zone
estimated_duration: 2d
risk_level: medium
---

## Goal

> Build the full component tree for the refactored Workspace — a fixed hero zone with mode-switching structural navigation and mode-adaptive hero cards, plus a scrollable collection zone with dense CRUD cards and a subordinate create affordance.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Hero Zone](phase-001-hero-zone/phase.md) | `draft` | 1d |
| 002 | [Collection Zone](phase-002-collection-zone/phase.md) | `draft` | 1d |

## Entry Criteria

> What must be true before this stage can begin.

- Stage 001 (Data & State Foundation) is `complete`
- Arc entity, workspace mode store, and workspace data service are functional

## Exit Criteria

> What must be true for this stage to be marked `complete`.

- All phases complete
- `WorkspaceHeroShell`, `StructureModeSwitcher`, `WorkspaceHeroCard` render correctly for all four modes
- Hero empty states display polished CTAs when no items exist
- `WorkspaceCollectionPane`, `StructureCrudCard`, `CreateStructureCard` render correctly
- Collection pane scrolls with hidden scrollbar
- CRUD cards support select, rename, delete actions
- Create card is visually subordinate and smaller than content cards
- All quality gates passed

## Notes

> Components live under `src/modules/workspace/components/`. The workspace module barrel (`src/modules/workspace/index.ts`) currently re-exports the outliner module; it will be extended to also export these new workspace-specific components.
>
> Hero card content adapts per mode: Arc shows title/description/purpose, Act shows title/intent/planning notes, Chapter shows title/summary/scene count, Scene shows title/POV/purpose/conflict. This requires four internal rendering branches within `WorkspaceHeroCard`.
>
> The hero card height must remain stable across all modes and empty states. Use `min-height` and consistent padding to prevent layout jumps.
