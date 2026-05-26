---
title: Data & State Foundation
slug: stage-001-data-and-state-foundation
stage_number: 1
status: draft
owner: Planner Agent
plan: refactor-005-workspace-surface
phases:
  - phase-001-arc-entity
  - phase-002-workspace-mode-state
estimated_duration: 1d
risk_level: low
---

## Goal

> Establish the data layer and reactive state management required by the new Workspace surface — a first-class Arc entity with full CRUD support, and a workspace mode store that tracks the active structural layer (Arcs / Acts / Chapters / Scenes) along with per-mode selection memory.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Arc Entity](phase-001-arc-entity/phase.md) | `draft` | 0.5d |
| 002 | [Workspace Mode State](phase-002-workspace-mode-state/phase.md) | `draft` | 0.5d |

## Entry Criteria

> What must be true before this stage can begin.

- refactor-004-navigation-and-structure is `complete`
- Dexie v7 schema is stable and all existing tests pass

## Exit Criteria

> What must be true for this stage to be marked `complete`.

- All phases complete
- `Arc` type exists in `src/lib/db/types.ts`
- `arcs` table configured in Dexie schema v8
- Arc CRUD repository and service functions exist with tests
- Workspace mode store manages active mode + per-mode selected IDs
- Workspace data service fetches all four entity types for a project
- All quality gates passed (lint, typecheck, tests)

## Notes

> The Arc entity is intentionally minimal: id, projectId, title, description, purpose, order, timestamps. Future work may add arc-to-chapter/scene assignment UI, but this stage only creates the entity itself.
>
> The workspace mode store uses Svelte 5 runes and preserves selected item IDs per mode so switching between Arcs→Scenes→Arcs does not reset the user's position.
