---
title: Project List & Create
slug: part-001-project-list-and-create
part_number: 1
status: complete
completed_at: 2026-04-12
owner: Frontend Agent
phase: phase-001-project-hub-ui
estimated_duration: 1d
---

## Objective

Build the `/projects` route: a project list screen with an empty-state call-to-action and a "New Project" create form. Clicking a project card navigates into the project and sets `activeProjectId`.

## Context

- `dev-docs/data-model.md` §Project — entity fields
- `src/modules/project-hub/services/project-repository.ts` — repository to call
- `src/lib/stores/active-project.ts` — set on project selection
- `dev-docs/modular-boundaries.md` — component file length limits and module boundary rules

## Target Files

| File                                                          | Action                                  |
| ------------------------------------------------------------- | --------------------------------------- |
| `src/routes/(app)/projects/+page.svelte`                      | Create — project list view (≤150 lines) |
| `src/modules/project-hub/stores/project-hub-store.ts`         | Create — reactive project list state    |
| `src/modules/project-hub/components/ProjectCard.svelte`       | Create — per-project card component     |
| `src/modules/project-hub/components/CreateProjectForm.svelte` | Create — create form (modal or inline)  |
| `src/modules/project-hub/index.ts`                            | Update — re-export new public symbols   |

## Create Form Fields

| Field             | Type     | Required            |
| ----------------- | -------- | ------------------- |
| `title`           | `string` | Yes                 |
| `genre`           | `string` | No                  |
| `logline`         | `string` | No                  |
| `synopsis`        | `string` | No                  |
| `targetWordCount` | `number` | No, default `80000` |

## Acceptance Criteria

- [x] `/projects` loads and shows all projects from `ProjectRepository.getAll()`
- [x] Empty state renders when no projects exist; includes "Create your first project" button
- [x] "New Project" form validates: `title` is required (non-empty string); shows inline error if blank on submit
- [x] Submitting the form calls `ProjectRepository.create(data)` and navigates to `/projects/[id]`
- [x] Clicking an existing project card: sets `activeProjectId` and navigates to `/projects/[id]`
- [x] `+page.svelte` is ≤150 lines; data fetching and mutation extracted to `project-hub-store.ts`
- [x] `pnpm run check` exits clean

## Out of Scope

- Edit and delete (→ part-002)
- Project statistics / word count dashboard (→ Path 4)
