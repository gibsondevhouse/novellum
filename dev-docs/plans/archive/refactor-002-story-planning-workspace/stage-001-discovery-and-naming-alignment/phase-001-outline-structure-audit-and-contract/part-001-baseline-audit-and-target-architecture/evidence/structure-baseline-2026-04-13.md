# Outline Structure Baseline Audit — 2026-04-13

## Audited Files

| File | Lines | Role |
| --- | --- | --- |
| `src/routes/projects/[id]/outline/+page.svelte` | ~250 | Route orchestrator (currently violating thinness constraint) |
| `src/routes/projects/[id]/outline/+page.ts` | 16 | Load function — thin and correct |
| `src/modules/outliner/stores/outliner.svelte.ts` | 38 | Store — minimal; lacks selected chapter/scene/act state |
| `src/modules/outliner/types.ts` | 6 | Public types — minimal; no Act/StoryFrame types |
| `src/modules/outliner/components/ChapterGroup.svelte` | ~150 | Chapter row + scene CRUD — mixed concerns |

---

## Blocking Issues

### 1. Route is not a thin orchestrator (violates Rule 3)

`+page.svelte` currently contains:

- Drag-and-drop logic (`dragId`, `dragOverIdx`, `onDragStart`, `onDrop`, `reorderChapters`) — ~40 lines
- Chapter CRUD handlers (`handleAddChapter`, `handleChapterDelete`, `handleChapterRename`) — ~30 lines
- Selection state management (`selection: OutlineSelection | null`) — ~20 lines
- DOM card-anchoring math (`computeCardOffset`, `cardTopOffset`, `querySelector`) — ~25 lines
- All template markup — ~80 lines

**Target:** ≤ 80 lines, composition only.

### 2. No Act or Story Frame concept

The data model has `Chapter → Scene → Beat`. There is no `Act` grouping layer. Planning context above the chapter level does not exist.

### 3. Store missing selection model

`outliner.svelte.ts` tracks `selectedBeatId` and `expandedChapterIds` only. There is no `selectedChapterId`, `selectedSceneId`, or `selectedActId`. The selection state lives in the route (`selection: OutlineSelection | null`), which is the wrong layer.

### 4. No shared planning surface shell

`ChapterOutlinePanel.svelte` and `SceneOutlinePanel.svelte` are independent, parallel components with duplicated layout logic (sticky header, internal scroll, card padding). They should share a `PlanningSurfaceShell` primitive.

### 5. `ChapterGroup` owns scene CRUD

`ChapterGroup.svelte` internally calls `createScene`, `updateScene`, `removeScene`, `reorderScenes`. This violates SRP — the component should delegate mutations upward or to a service, not own them.

### 6. Navigator is not a standalone component

There is no `HierarchyNavigator` component. Navigation is rendered inline in the route via `{#each chapters as chapter}` loops. When Act grouping is added, this will be unmanageable without extraction.

---

## Target Architecture Contract

### Route (`+page.svelte`) — orchestration only

```svelte
<script lang="ts">
  import HierarchyNavigator from '$modules/outliner/components/HierarchyNavigator.svelte';
  import PlanningSurfaceShell from '$modules/outliner/components/planning-surface/PlanningSurfaceShell.svelte';
  let { data } = $props();
</script>

<div class="outline-workspace">
  <HierarchyNavigator storyFrame={data.storyFrame} acts={data.acts} chapters={data.chapters} />
  <PlanningSurfaceShell />
</div>
```

Target: ≤ 80 lines.

### Store additions (`outliner.svelte.ts`)

```ts
let selectedChapterId: string | null = $state(null);
let selectedSceneId:   string | null = $state(null);
let selectedActId:     string | null = $state(null);
```

All selection mutation must go through the store, not route-local state.

### New components

| Component | Path | Responsibility |
| --- | --- | --- |
| `HierarchyNavigator` | `components/HierarchyNavigator.svelte` | Act/chapter/scene tree with expand-collapse and keyboard nav |
| `ActGroup` | `components/ActGroup.svelte` | Act-level grouping row |
| `StoryFramePanel` | `components/StoryFramePanel.svelte` | Story Frame editing surface |
| `ActPlanningPanel` | `components/ActPlanningPanel.svelte` | Act-level planning notes |
| `PlanningSurfaceShell` | `components/planning-surface/PlanningSurfaceShell.svelte` | Shared layout wrapper for detail panels |
| `PlanningSurfaceCard` | `components/planning-surface/PlanningSurfaceCard.svelte` | Shared card primitive |
| `BeatOverlay` | `components/beats/BeatOverlay.svelte` | Focused beat editing overlay |
| `BeatNumberField` | `components/beats/BeatNumberField.svelte` | Numbered beat input unit |
| `PacingSignal` | `components/PacingSignal.svelte` | Density band indicator |
| `ArcTagHint` | `components/ArcTagHint.svelte` | Optional arc-hook affordance |

### New services

| Service | Path | Responsibility |
| --- | --- | --- |
| `storyStructureService` | `services/story-structure-service.ts` | StoryFrame + Act CRUD |
| `pacingTelemetry` | `services/pacing-telemetry.ts` | Structural count and density metrics |
| `outlineToWorkspaceMigration` | `services/migrations/outline-to-story-workspace.ts` | Idempotent migration from flat-chapter to act-grouped model |

### Schema additions (Dexie v7)

```ts
export const schemaV7 = {
  ...schemaV6,
  story_frames: 'id, projectId',
  acts: 'id, projectId, order',
};
```

`Chapter` gains an optional `actId?: string` field. Default migration assigns all existing chapters to a synthetic default act per project.

### Naming contract

| Old / Informal Term | Canonical Term in Code |
| --- | --- |
| "Outline page" | Story Planning Workspace (`/projects/[id]/outline`) |
| "Chapter overview" | Chapter Planning Panel |
| "Scene panel" | Scene Planning Panel |
| "Beat row" | Beat unit (numbered) |
| (new) | Story Frame |
| (new) | Act |

---

## Handoff Notes for Stage 002+

1. Dexie must be bumped to v7 before any Story Frame / Act CRUD is wired.
2. `Chapter.actId` must be optional everywhere — never assume it is set.
3. All new components must be exported through `src/modules/outliner/index.ts`.
4. Route thinness (≤ 80 lines) must be validated at each stage exit.
5. Tests must include fixture-based coverage for projects with 0 acts, 1 act, and 3+ acts.
