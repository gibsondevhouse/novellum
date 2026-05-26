# Outliner Module

## Purpose

Provide the Story Planning Workspace — a structured, hierarchy-aware surface for organizing and planning a novel's acts, chapters, scenes, and beats.

## Hierarchy

```text
Story Frame
  └─ Act (1..n)
       └─ Chapter (1..n)
            └─ Scene (1..n)
                 └─ Beat (1..n)
```

## Core Concepts

- **Story Frame** — Top-level planning container: premise, theme, tone notes, and optional arc references
- **Act** — Structural division of the story (e.g. Act I / II / III); contains ordered chapters
- **Chapter** — Narrative unit; owned by an act; contains ordered scenes
- **Scene** — Atomic narrative event; contains ordered beats
- **Beat** — Numbered planning unit within a scene or chapter context

## Features

- Story Frame and Act entity CRUD
- Chapter-to-act assignment and reordering
- Selector-first `HierarchyNavigator` (act → chapter → scene tree)
- Shared `PlanningSurfaceShell` for chapter and scene detail panels
- Numbered beat workflow with focused `BeatOverlay`
- Pacing telemetry: act/chapter/scene/beat counts, density bands, sparse-content warnings
- Minimal arc-hook extension points (optional `arcRef` fields in planning entities)
- Outline-to-workspace migration script (idempotent, rollback-safe)

## Public API (`index.ts`)

Exposes only what downstream routes and shared components need:

- `ChapterWithScenes`, `ChapterWithScenesAndAct` types
- `HierarchyNavigator`, `PlanningSurfaceShell`, `StoryFramePanel`, `ActPlanningPanel` components
- `outlinerStore` (selected act/chapter/scene, expanded nodes, loading)
- `storyStructureService` (Story Frame + Act CRUD)
- `pacingTelemetry` (structural metrics)

## Route Contract

`src/routes/projects/[id]/outline/+page.ts` must:

- Load Story Frame, Acts, ChaptersWithScenes in a single composite object
- Keep the load function ≤ 30 lines

`src/routes/projects/[id]/outline/+page.svelte` must:

- Be an orchestration surface only (≤ 80 lines)
- Delegate all structure rendering to `HierarchyNavigator`
- Delegate all detail panel rendering to `PlanningSurfaceShell`

## Module Constraints

- No direct Dexie access from components — use repository services
- No cross-module internal imports (outliner may not import from `bible/` or `editor/` internals)
- Beat overlay must not block navigator keyboard navigation
- Pacing telemetry must not introduce perceptible latency

## Migration Notes

Existing `Chapter`/`Scene`/`Beat` records are unchanged. Schema additions (StoryFrame, Act) are additive and backward-compatible. Legacy projects load with a default single-act grouping automatically applied at load time.

See `src/modules/outliner/services/migrations/outline-to-story-workspace.ts` for the migration script.
