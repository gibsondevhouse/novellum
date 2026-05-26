---
title: Arcs Index Workspace
slug: stage-002-arcs-index-workspace
stage_number: 2
status: complete
owner: Architect Agent
plan: plan-013-workspace-hierarchy-flow
phases: []
estimated_duration: 2d
risk_level: low
---

## Goal

Replace the placeholder `/projects/[id]/arcs/+page.svelte` ("coming soon") with a real Arcs index workspace that lists, creates, edits, reorders, and deletes arcs for the active project.

## Phases

> Suggested decomposition:
>
> - phase-001-arcs-page-loader — `+page.ts` loads arcs via `arc-repository.getArcsByProjectId`; `+page.svelte` composes `WorkspaceShell` + `WorkspaceHero` + arcs list panel.
> - phase-002-arc-list-and-cards — `ArcListPanel.svelte`, `ArcCard.svelte` displaying arc metadata (title, type, status, count of acts).
> - phase-003-arc-create-edit-flows — `ArcCreateForm.svelte`, `ArcEditDialog.svelte`; uses `createArc` / `updateArc` from repository.
> - phase-004-arc-reorder-and-delete — drag-handle reorder against `/api/db/arcs/reorder`; delete confirmation dialog.
> - phase-005-empty-state-and-a11y — `EmptyStatePanel` for projects with no arcs; keyboard navigation; ARIA labels per `accessibility-a11y` skill.

## Entry Criteria

- Stage 001 complete: `act-repository`, scoped helpers, hierarchy store all in place.
- Existing `arc-repository.ts` (in outliner module) is exported from `$modules/outliner` barrel and accessible to the arcs route. If repository ownership needs to move from outliner to project module, scope that move into a phase here.

## Exit Criteria

- `src/routes/projects/[id]/arcs/+page.ts` loads arcs.
- `src/routes/projects/[id]/arcs/+page.svelte` renders `WorkspaceShell` with hero + arcs list + create button; placeholder copy is gone.
- New components (Svelte 5 Runes):
  - `src/modules/project/components/ArcListPanel.svelte`
  - `src/modules/project/components/ArcCard.svelte`
  - `src/modules/project/components/ArcCreateForm.svelte`
  - `src/modules/project/components/ArcEditDialog.svelte`
- Arc count badge per arc reflects the number of acts whose `arcId` matches the arc.
- Empty state uses canonical `EmptyStatePanel`.
- Navigation to a single arc uses `goto('/projects/[id]/arcs/[arcId]')` (route is delivered in Stage 003; until then, link is wired but lands on a "coming soon" stub created in this stage with explicit TODO marker).
- `pnpm run lint`, `pnpm run check`, `pnpm run test`, `pnpm run check:tokens` all pass.

## Notes

- Arc type and status visualization should reuse existing badge/pill primitives. No new visual tokens.
- The Arc create form must inherit no parent context — arcs are top-level inside a project.
- Reorder operations must not block the UI; use optimistic updates with rollback on failure (mirror existing chapter reorder pattern in the outliner).
- Boundary check: this stage's components live under `src/modules/project/components/`. No imports from `$modules/outliner` are permitted; if `arc-repository` must move out of `outliner`, that is a Stage 001 concern, not this stage's.
