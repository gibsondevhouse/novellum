---
title: Project Detail & Edit
slug: part-002-project-detail-edit
part_number: 2
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-001-project-hub-ui
estimated_duration: 1d
---

## Objective

Build the `/projects/[id]` detail view showing project metadata and an edit form. Include a delete action with confirmation. This is the canonical "project home" screen from which users navigate to Bible, Outliner, and Editor.

## Context

- `src/modules/project-hub/services/project-repository.ts` — `getById()`, `update()`, `delete()`
- `src/modules/project-hub/stores/project-hub-store.ts` — extend with `loadProject(id)`, `updateProject()`, `deleteProject()`
- `src/lib/stores/active-project.ts` — clear on project delete

## Target Files

| File                                                            | Action                                         |
| --------------------------------------------------------------- | ---------------------------------------------- |
| `src/routes/(app)/projects/[id]/+page.svelte`                   | Create — project detail/edit view (≤150 lines) |
| `src/modules/project-hub/components/EditProjectForm.svelte`     | Create — edit form component                   |
| `src/modules/project-hub/components/DeleteProjectDialog.svelte` | Create — confirmation dialog                   |
| `src/modules/project-hub/stores/project-hub-store.ts`           | Update — add project detail actions            |

## Navigation Links from This View

- → `/projects/[id]/bible/characters` — Story Bible
- → `/projects/[id]/outline` — Outliner
- → `/projects/[id]/editor` — Draft Editor (stub link until stage-005)

## Acceptance Criteria

- [x] `/projects/[id]` loads and displays: title, genre, logline, synopsis, targetWordCount, createdAt
- [x] Edit form pre-populates all fields from loaded project; submitting calls `ProjectRepository.update()` with changed fields only
- [x] "Delete Project" button opens `DeleteProjectDialog`; confirming calls `ProjectRepository.delete()`, clears `activeProjectId`, and redirects to `/projects`
- [x] Navigation links to Bible, Outliner, Editor are present and use SvelteKit `goto()`
- [x] `pnpm run check` exits clean; `pnpm run lint` exits clean

## Out of Scope

- Project statistics (word count, scene count) — Path 4
- Project cover image — Path 4
