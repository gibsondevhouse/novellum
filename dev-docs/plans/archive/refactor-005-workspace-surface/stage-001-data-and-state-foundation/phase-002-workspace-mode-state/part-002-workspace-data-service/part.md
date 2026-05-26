---
title: Workspace Data Service
slug: part-002-workspace-data-service
part_number: 2
status: draft
owner: backend
assigned_to: backend
phase: phase-002-workspace-mode-state
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

> Create a unified workspace data service that loads all four structural entity types (arcs, acts, chapters with scenes, and standalone scenes) for a given project, providing the component layer with a single data payload to drive both the hero card and collection pane.

## Scope

**In scope:**

- Workspace data service at `src/modules/workspace/services/workspace-data-service.ts`
- `WorkspaceData` interface combining all entity arrays
- Unified fetch function returning arcs, acts, chapters (with scene counts), and scenes
- Unit tests

**Out of scope:**

- Caching or memoization (Dexie queries are fast enough for local-first)
- Reactive live queries (future enhancement)

## Implementation Steps

1. Create `src/modules/workspace/services/workspace-data-service.ts`
2. Define `WorkspaceData` interface:
   - `arcs: Arc[]`
   - `acts: Act[]`
   - `chapters: ChapterWithScenes[]`
   - `scenes: Scene[]`
   - `characters: Character[]` (needed for scene POV display)
3. Implement `getWorkspaceData(projectId: string): Promise<WorkspaceData>`:
   - Fetch arcs via `getArcsByProjectId(projectId)`
   - Fetch acts via `getActsByProjectId(projectId)`
   - Fetch chapters via `getChaptersByProjectId(projectId)` then join scenes
   - Fetch all scenes via `getScenesByProjectId(projectId)`
   - Fetch characters via `db.characters.where('projectId').equals(projectId).toArray()`
   - Return combined payload
4. Add `WorkspaceData` type to `src/modules/workspace/types.ts`
5. Export from `src/modules/workspace/index.ts`
6. Write tests in `src/modules/workspace/services/__tests__/workspace-data-service.test.ts`

## Files

**Create:**

- `src/modules/workspace/services/workspace-data-service.ts`
- `src/modules/workspace/services/__tests__/workspace-data-service.test.ts`

**Update:**

- `src/modules/workspace/types.ts` — add `WorkspaceData` interface
- `src/modules/workspace/index.ts` — export data service

## Acceptance Criteria

- [ ] `getWorkspaceData(projectId)` returns arcs, acts, chapters, scenes, and characters
- [ ] Arcs are sorted by `order`
- [ ] Acts are sorted by `order`
- [ ] Chapters include their nested scenes (as `ChapterWithScenes`)
- [ ] Scenes array contains all project scenes sorted by `order`
- [ ] Characters array is returned for POV display purposes
- [ ] Tests verify correct data assembly

## Edge Cases

- Project with no arcs, acts, chapters, or scenes returns empty arrays for each
- Characters array may be empty (no characters created yet)

## Notes

> This service consolidates what the current `+page.ts` does (load acts + chapters) and extends it to also include arcs, all scenes, and characters. The `+page.ts` loader will delegate to this service.
