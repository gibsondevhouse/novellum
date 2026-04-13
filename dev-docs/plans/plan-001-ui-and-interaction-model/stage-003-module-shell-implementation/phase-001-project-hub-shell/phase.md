---
title: Project Hub Shell
slug: phase-001-project-hub-shell
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-003-module-shell-implementation
parts:
  - part-001-project-list-page
  - part-002-project-detail-layout
estimated_duration: 2d
---

## Goal

Build the Project Hub — the entry point of the application. Writers land here after launch, see all their projects, and navigate into a project. This phase produces a working project list page and a project detail layout that anchors the per-project navigation.

## Parts

| #   | Part                                                            | Status  | Assigned To    | Est. Duration |
| --- | --------------------------------------------------------------- | ------- | -------------- | ------------- |
| 001 | [Project List Page](part-001-project-list-page/part.md)         | `draft` | Frontend Agent | 1d            |
| 002 | [Project Detail Layout](part-002-project-detail-layout/part.md) | `draft` | Frontend Agent | 1d            |

## Acceptance Criteria

- [ ] `src/routes/+page.svelte` renders a project list read from Dexie `projects` table
- [ ] Empty state shown when no projects exist with a "Create Project" call-to-action
- [ ] `src/routes/projects/[id]/+layout.svelte` renders with project title and per-project sidebar links
- [ ] Navigating to `/projects/{id}` where `id` does not exist redirects to home with an error message
- [ ] `pnpm run check` and `pnpm run lint` pass
