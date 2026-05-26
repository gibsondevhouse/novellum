---
title: Arc Detail Workspace
slug: stage-003-arc-detail-workspace
stage_number: 3
status: complete
owner: Architect Agent
plan: plan-013-workspace-hierarchy-flow
phases: []
estimated_duration: 2d
risk_level: low
---

## Goal

Build a new route `/projects/[id]/arcs/[arcId]` that shows a single arc's metadata and lists its scoped acts, with create/edit/reorder/delete flows for acts and an explicit "Unassigned acts" surface for legacy data.

## Phases

> Suggested decomposition:
>
> - phase-001-arc-detail-route — `+page.ts` loads the arc via `getArcById` plus scoped acts via `getActsByArcId`; `+page.svelte` composes the shell.
> - phase-002-arc-detail-hero — `ArcDetailHero.svelte` showing arc title, description, purpose, type, status; back link to arcs index.
> - phase-003-act-list-panel — `ActListPanel.svelte`, `ActCard.svelte` rendering scoped acts with chapter counts.
> - phase-004-act-create-edit — `ActCreateForm.svelte`, `ActEditDialog.svelte`; create flow auto-fills `arcId` from route param.
> - phase-005-unassigned-acts-surface — explicit panel listing acts where `arcId` is null, with a "Move to this arc" affordance.

## Entry Criteria

- Stage 001 complete (act-repository + hierarchy store).
- Stage 002 complete (arcs index workspace; navigation entry point exists).

## Exit Criteria

- New route shipped: `src/routes/projects/[id]/arcs/[arcId]/+page.ts` and `+page.svelte`.
- New components (Svelte 5 Runes):
  - `src/modules/project/components/ArcDetailHero.svelte`
  - `src/modules/project/components/ActListPanel.svelte`
  - `src/modules/project/components/ActCard.svelte`
  - `src/modules/project/components/ActCreateForm.svelte`
  - `src/modules/project/components/ActEditDialog.svelte`
- Hierarchy store updates `selectedArcId` when this route mounts and clears it when navigating away to a non-hierarchy route.
- Unassigned acts panel renders only when at least one act with `arcId === null` exists for the project; otherwise hidden.
- Empty state for arcs with zero acts uses `EmptyStatePanel`.
- Navigation to an act uses `goto('/projects/[id]/arcs/[arcId]/acts/[actId]')` — Stage 004 delivers that route; until then, the act card links to a stub.
- All quality gates green.

## Notes

- The route is a child of `arcs/[arcId]/`. SvelteKit nested layouts are not required for this stage; Stage 004 may introduce a layout if drilldown breadcrumbs need to share state.
- "Move to this arc" affordance updates `act.arcId` via `updateAct`; success refreshes both the scoped list and the unassigned list.
- Deletion of an arc that has scoped acts should prompt the user: "Delete arc and orphan N acts? Acts will move to Unassigned." No cascade delete in this plan.
- A11y: the back-to-arcs-index link must be keyboard-reachable as the first focusable element on route enter (per `accessibility-a11y` skill).
