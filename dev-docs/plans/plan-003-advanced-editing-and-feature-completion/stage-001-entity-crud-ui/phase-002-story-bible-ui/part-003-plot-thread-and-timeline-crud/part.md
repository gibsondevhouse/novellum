---
title: Plot Thread & Timeline CRUD
slug: part-003-plot-thread-and-timeline-crud
part_number: 3
status: complete
owner: Frontend Agent
phase: phase-002-story-bible-ui
estimated_duration: 1d
---

## Objective

Build Plot Thread and Timeline Event sections of the Story Bible. Plot Threads track narrative arcs with a status lifecycle (`open` → `in-progress` → `resolved`). Timeline Events track narrative history ordered by a `date` field.

## Context

- `dev-docs/data-model.md` §PlotThread, §TimelineEvent
- `src/modules/bible/services/plot-thread-repository.ts` and `timeline-event-repository.ts` (plan-002)

## Target Files

| File                                                             | Action              |
| ---------------------------------------------------------------- | ------------------- |
| `src/routes/(app)/projects/[id]/bible/plot-threads/+page.svelte` | Create (≤150 lines) |
| `src/routes/(app)/projects/[id]/bible/timeline/+page.svelte`     | Create (≤150 lines) |
| `src/modules/bible/components/PlotThreadForm.svelte`             | Create              |
| `src/modules/bible/components/TimelineEventForm.svelte`          | Create              |

## Plot Thread Form Fields

`title` (required), `description`, `status` (select: `open` | `in-progress` | `resolved`), `relatedSceneIds[]`

## Timeline Event Form Fields

`title` (required), `date` (string, narrative date — not necessarily ISO; e.g. "Year 3, Day 47"), `description`, `relatedEntityIds[]`

## Acceptance Criteria

- [ ] Plot thread list groups or labels threads by status; status badge updates in-place on change without full page reload
- [ ] Timeline list sorted by `date` ascending (string sort acceptable; document limitation)
- [ ] Both support full CRUD with required field validation
- [ ] `relatedSceneIds` in plot thread form shows scene titles for the active project
- [ ] `relatedEntityIds` in timeline form shows readable names (characters + locations)
- [ ] `pnpm run check` exits clean; `pnpm run lint` exits clean
- [ ] All `+page.svelte` files ≤150 lines

## Out of Scope

- Timeline visualization (Gantt/chronological chart) — Path 4
- Plot thread dependency graph — Path 4
