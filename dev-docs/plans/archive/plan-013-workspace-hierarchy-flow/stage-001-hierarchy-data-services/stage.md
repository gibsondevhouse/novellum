---
title: Hierarchy Data Services
slug: stage-001-hierarchy-data-services
stage_number: 1
status: complete
owner: Backend Agent
plan: plan-013-workspace-hierarchy-flow
phases: []
estimated_duration: 2d
risk_level: low
---

## Goal

Land the client-side data layer for the Arc → Act → Chapter → Scene hierarchy: an `act-repository`, scoped query helpers across all four entities, and a Svelte 5 hierarchy store that holds selected Arc / Act / Chapter context per project.

## Phases

> Suggested decomposition (to be expanded into `phase-NNN-<slug>/phase.md` directories before execution):
>
> - phase-001-act-repository — new `src/modules/project/services/act-repository.ts` mirroring `chapter-repository` (CRUD + reorder + scoped queries).
> - phase-002-scoped-query-helpers — add `getActsByArcId`, ensure `getChaptersByActId` and `getScenesByChapterId` exist or add them; export from module barrels.
> - phase-003-hierarchy-store — `src/modules/project/stores/hierarchy-store.svelte.ts` with `$state` for selected `arcId`/`actId`/`chapterId` keyed by `projectId`, `$derived` selectors for scoped lists, and a `resetForProject(projectId)` lifecycle.

## Entry Criteria

- SQLite hierarchy tables and reorder endpoints are present on `master` (verified 2026-04-28).
- `arc-repository.ts`, `chapter-repository.ts`, `scene-repository.ts` exist as the pattern to mirror.

## Exit Criteria

- `src/modules/project/services/act-repository.ts` exports `getActsByProjectId`, `getActsByArcId`, `getActById`, `createAct`, `updateAct`, `deleteAct`, `reorderActs` against `/api/db/acts`.
- Scoped helpers exist:
  - `getActsByArcId(arcId): Promise<Act[]>` (with unassigned mode for `arcId === null`).
  - `getChaptersByActId(actId): Promise<Chapter[]>` (with unassigned mode for `actId === null`).
  - `getScenesByChapterId(chapterId): Promise<Scene[]>` already exists; verify and re-export if needed.
- `src/modules/project/stores/hierarchy-store.svelte.ts` exposes:
  - `selectArc(projectId, arcId | null)`, `selectAct(projectId, actId | null)`, `selectChapter(projectId, chapterId | null)`.
  - `getSelectedArc(projectId)`, `getSelectedAct(projectId)`, `getSelectedChapter(projectId)`.
  - `resetForProject(projectId)`.
  - `$derived` getters that return scoped lists when given a fully-loaded project payload.
- Vitest coverage on the new repository and store reaches ≥ 80% lines (services contract requirement).
- `pnpm run lint`, `pnpm run check`, `pnpm run test` all pass.

## Notes

- The store must key all selection state by `projectId` to avoid leaking selection across projects.
- `null` is a meaningful selection value meaning "unassigned" and must round-trip through the scoped helpers without throwing.
- Do not introduce a new HTTP client; reuse the existing `fetch` wrappers used by `chapter-repository`.
- Boundary check: store imports types only from `$lib/db/types` and services from `$modules/project/services`. No imports from `$modules/editor` or `$modules/outliner`.
