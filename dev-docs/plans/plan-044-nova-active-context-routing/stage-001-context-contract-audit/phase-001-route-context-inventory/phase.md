---
title: Route Context Inventory
slug: phase-001-route-context-inventory
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-001-context-contract-audit
---

## Findings

The following routes currently define active context via route parameters or search parameters:

### Project Context (`projectId`)
- **Pattern**: `/projects/[id]/...`
- **Source**: `page.params.id`
- **Current Resolver**: `activeProject.id` (getter in `src/lib/stores/active-project.svelte.ts`).
- **Layout Usage**: `src/routes/+layout.svelte` correctly derives `activeProjectId` using `page.url.pathname.startsWith('/projects/')`.

### Scene Context (`activeSceneId`)
- **Pattern**: `/projects/[id]/editor/[sceneId]`
- **Source**: `page.params.sceneId`
- **Fallback/Override**: `page.url.searchParams.get('sceneId')`
- **Current Issue**: The root layout ONLY looks at `searchParams.get('sceneId')`. When navigating to the editor via route params, `NovaPanel` loses scene context unless manually passed or query-stringed.

### Chapter Context (`activeChapterId`)
- **Pattern**: `/projects/[id]/arcs/[arcId]/acts/[actId]/chapters/[chapterId]`
- **Source**: `page.params.chapterId`
- **Fallback/Override**: `page.url.searchParams.get('chapterId')`
- **Current Issue**: Same as `sceneId`; the root layout only respects `searchParams`.

## Inventory Summary

| Parameter | Route Source | Query Source | Current Detection |
| :--- | :--- | :--- | :--- |
| `projectId` | `page.params.id` | N/A | Good (Path-prefixed check) |
| `activeSceneId` | `page.params.sceneId` | `?sceneId=...` | **Incomplete** (Query only) |
| `activeChapterId` | `page.params.chapterId` | `?chapterId=...` | **Incomplete** (Query only) |

## Quality Gate Checklist

- [x] All Nova context consumers listed? Yes.
- [x] Required and optional fields documented? Yes.
- [x] Query-param-only dependencies identified? Yes (Scene and Chapter).
