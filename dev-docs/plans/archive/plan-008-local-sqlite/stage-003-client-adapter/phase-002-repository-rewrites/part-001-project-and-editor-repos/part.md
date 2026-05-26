---
title: Project and Editor Repositories
slug: part-001-project-and-editor-repos
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-repository-rewrites
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

> Rewrite the project module repositories (`project-repository.ts`, `chapter-repository.ts`) and all editor module repositories (`scene-repository.ts`, `beat-repository.ts`, `snapshot-repository.ts`) to use the fetch API client.

## Scope

**In scope:**

- `src/modules/project/services/project-repository.ts`
- `src/modules/project/services/chapter-repository.ts`
- `src/modules/editor/services/scene-repository.ts`
- `src/modules/editor/services/beat-repository.ts`
- `src/modules/editor/services/snapshot-repository.ts`
- `src/lib/db/projects.ts` — update or mark deprecated based on usage audit

**Out of scope:**

- `src/modules/editor/services/autosave-service.ts` (no direct Dexie calls — only calls scene-repository)
- Any Svelte component files

## Implementation Steps

1. Audit usages of `src/lib/db/projects.ts` — if unused externally, add deprecation comment; if used, reroute to API
2. Rewrite `project-repository.ts`:
   - `createProject` → `apiPost<Project>('/api/db/projects', data)`
   - `getProjectById` → `apiGet<Project>('/api/db/projects/${id}')`
   - `getAllProjects` → `apiGet<Project[]>('/api/db/projects')`
   - `updateProject` → `apiPut<Project>('/api/db/projects/${id}', data)`
   - `removeProject` → `apiDel('/api/db/projects/${id}')`
3. Rewrite `chapter-repository.ts` using same pattern, adding `?projectId` param for `getChaptersByProjectId`
4. For `reorderChapters`: call `apiPut('/api/db/chapters/reorder', { orderedIds })`
5. Rewrite `scene-repository.ts` with `?chapterId` and `?projectId` filter support
6. For `reorderScenes`: call scene reorder endpoint
7. Rewrite `beat-repository.ts` with `?sceneId` filter support
8. Rewrite `snapshot-repository.ts` with `?sceneId` filter

## Files

**Update:**

- `src/modules/project/services/project-repository.ts`
- `src/modules/project/services/chapter-repository.ts`
- `src/modules/editor/services/scene-repository.ts`
- `src/modules/editor/services/beat-repository.ts`
- `src/modules/editor/services/snapshot-repository.ts`
- `src/lib/db/projects.ts` (update or deprecate)

## Acceptance Criteria

- [ ] All five repository files import from `$lib/api-client` instead of `$lib/db`
- [ ] All exported function names and signature types are unchanged
- [ ] `getChaptersByProjectId` still returns chapters in `order ASC`
- [ ] `reorderChapters` bulk-updates `order` via the reorder endpoint
- [ ] `pnpm check` passes with zero errors on all updated files

## Edge Cases

- `getProjectById` returns `undefined` when project is missing (not null, not throws) — API returns 404, catch and return `undefined`
- `getChapterById` same: 404 → `undefined`
- All `update*` functions: if the item doesn't exist, the API returns 404 — decide whether to throw or swallow (V1: throw, let callers handle)

## Notes

> After rewriting, the `hub-metrics-service.ts` in `src/modules/project/services/` should still work unchanged since it calls `chapter-repository.ts` functions, not Dexie directly.
