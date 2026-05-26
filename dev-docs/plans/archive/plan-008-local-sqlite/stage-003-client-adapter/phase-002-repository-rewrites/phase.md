---
title: Repository Rewrites
slug: phase-002-repository-rewrites
phase_number: 2
status: draft
owner: Frontend Agent
stage: stage-003-client-adapter
parts:
  - part-001-project-and-editor-repos
  - part-002-bible-outliner-consistency-repos
estimated_duration: 1.5d
---

## Goal

> Rewrite all module repository files to call the `/api/db/*` endpoints via `ApiClient` instead of using Dexie — preserving all exported function signatures so upstream consumers (stores, components, SvelteKit load functions) are unaffected.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Project and Editor Repositories](part-001-project-and-editor-repos/part.md) | `draft` | Frontend Agent | 0.75d |
| 002 | [Bible, Outliner, and Consistency Repositories](part-002-bible-outliner-consistency-repos/part.md) | `draft` | Frontend Agent | 0.75d |

## Acceptance Criteria

- [ ] `src/modules/project/services/project-repository.ts` uses `apiGet`, `apiPost`, `apiPut`, `apiDel`
- [ ] `src/modules/project/services/chapter-repository.ts` uses API client
- [ ] `src/modules/editor/services/scene-repository.ts` uses API client
- [ ] `src/modules/editor/services/beat-repository.ts` uses API client
- [ ] `src/modules/editor/services/snapshot-repository.ts` uses API client
- [ ] `src/modules/bible/services/*-repository.ts` all use API client
- [ ] `src/modules/outliner/services/arc-repository.ts` uses API client
- [ ] `src/modules/consistency/services/consistency-repository.ts` uses API client
- [ ] `src/lib/db/projects.ts` updated to call project API (or deprecated — see notes)
- [ ] Zero Dexie imports in any rewritten file
- [ ] All prior callers (stores, components, `+page.ts` load functions) continue to compile without changes
- [ ] `pnpm check` passes with zero errors

## Notes

> `src/lib/db/projects.ts` is a thin helper that calls Dexie directly. It should be updated to call the API, or removed if no consumers exist outside the module repositories. Check usages before deciding.
>
> The `autosave-service.ts` in the editor module uses `scene-repository.ts` — verify it still works after the repository swap.
