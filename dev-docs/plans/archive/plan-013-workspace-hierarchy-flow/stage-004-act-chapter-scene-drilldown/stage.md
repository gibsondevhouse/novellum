---
title: Act / Chapter / Scene Drilldown
slug: stage-004-act-chapter-scene-drilldown
stage_number: 4
status: complete
owner: Architect Agent
plan: plan-013-workspace-hierarchy-flow
phases: []
estimated_duration: 3d
risk_level: medium
---

## Goal

Complete the navigable hierarchy by delivering Act detail and Chapter detail surfaces that scope chapters and scenes correctly, with the editor as the terminal navigation target for individual scenes.

## Phases

> Suggested decomposition:
>
> - phase-001-act-detail-route — `/projects/[id]/arcs/[arcId]/acts/[actId]` route loading the act and its scoped chapters via `getChaptersByActId`.
> - phase-002-chapter-list-on-act — `ChapterListPanel.svelte`, `ChapterCard.svelte` reused or new; chapter create form auto-fills `actId`.
> - phase-003-chapter-detail-route — `/projects/[id]/arcs/[arcId]/acts/[actId]/chapters/[chapterId]` route with scoped scenes via `getScenesByChapterId`; scenes link to the editor.
> - phase-004-unassigned-chapters-and-scenes — explicit grouping for chapters with `actId === null` (rendered on act detail) and scenes orphaned by chapter deletion (rendered on chapter detail with explanation).
> - phase-005-breadcrumbs-and-context — shared breadcrumb component (`HierarchyBreadcrumb.svelte`) reading hierarchy store; renders `Arc → Act → Chapter` with correct anchor links per route depth.

## Entry Criteria

- Stage 003 complete (arc detail workspace with act creation).
- Hierarchy store from Stage 001 is exposed and tested.

## Exit Criteria

- New routes shipped:
  - `src/routes/projects/[id]/arcs/[arcId]/acts/[actId]/+page.ts` and `+page.svelte`
  - `src/routes/projects/[id]/arcs/[arcId]/acts/[actId]/chapters/[chapterId]/+page.ts` and `+page.svelte`
- New components (Svelte 5 Runes):
  - `src/modules/project/components/ChapterListPanel.svelte` (or extend existing chapter list if one exists in outliner without violating boundaries).
  - `src/modules/project/components/ChapterCard.svelte`
  - `src/modules/project/components/SceneListPanel.svelte`
  - `src/modules/project/components/SceneCard.svelte`
  - `src/modules/project/components/HierarchyBreadcrumb.svelte`
- Scene cards link to `goto('/projects/[id]/editor?sceneId=[sceneId]')` (or the canonical editor entry point); navigation never bypasses `goto()`.
- Chapter delete prompts a confirmation that lists scoped scenes: "Delete chapter and orphan N scenes?"
- Breadcrumb is reachable from every level of the hierarchy and reflects the route, not just the store.
- All quality gates green.

## Notes

- The chapter and scene list components in this stage **must not** import from `$modules/editor` or `$modules/outliner`. If shared chapter primitives are needed, lift them into `$modules/project/components/`. Outliner-specific list components remain inside the outliner.
- Hierarchy store updates: route mounts call `selectArc(projectId, arcId)`, `selectAct(projectId, actId)`, `selectChapter(projectId, chapterId)` as appropriate. Selection persists across in-hierarchy navigation; navigating to a non-hierarchy route (e.g. world-building) does not clear it; navigating to a different project does.
- Server-side `+page.ts` loaders should fetch only the data needed for the current view (no recursive deep loads). The arc page does not preload acts; the act page does not preload chapters' scenes. Defer-load is intentional.
- A11y: breadcrumbs must use a `<nav aria-label="Breadcrumb">` landmark with `aria-current="page"` on the leaf.
