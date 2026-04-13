---
title: Project Hub UI
slug: phase-001-project-hub-ui
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-001-entity-crud-ui
parts:
  - part-001-project-list-and-create
  - part-002-project-detail-edit
estimated_duration: 2d
---

## Goal

Implement the Project Hub: a landing screen that lists all projects and allows creating new ones, plus a project detail/edit view for managing title, genre, logline, synopsis, and target word count.

## Parts

| #   | Part                                                              | Status     |
| --- | ----------------------------------------------------------------- | ---------- |
| 001 | [Project List & Create](part-001-project-list-and-create/part.md) | `complete` |
| 002 | [Project Detail & Edit](part-002-project-detail-edit/part.md)     | `complete` |

## Entry Criteria

- `ProjectRepository` (`src/modules/project-hub/services/project-repository.ts`) exists and is tested
- `activeProjectId` app-level store exists at `src/lib/stores/active-project.ts`
- Route `src/routes/(app)/` shell scaffolded with sidebar navigation

## Exit Criteria

- `/projects` route renders a list of all projects; empty state shown when none exist
- "New Project" action opens a create form; submitting persists via `ProjectRepository.create()`
- Clicking a project card navigates to `/projects/[id]` and sets `activeProjectId`
- `/projects/[id]` shows project metadata and an "Edit" form
- Deleting a project shows a confirmation dialog before calling `ProjectRepository.delete()`
- All `+page.svelte` files ≤150 lines; form logic extracted to a service or store
