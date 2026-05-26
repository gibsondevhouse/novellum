---
title: Refactor Project Workspace Pages
slug: part-002-refactor-project-workspace-pages
part_number: 2
status: review
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-core-and-knowledge-route-refactors
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1.5d
---

## Objective

Refactor project core routes to a consistent shell, navigation, and interaction model while preserving route correctness and page intent.

## Scope

**In scope:**

- Routes: `/projects/[id]`, `/projects/[id]/hub`, `/projects/[id]/workspace`, `/projects/[id]/outline`, `/projects/[id]/editor`, `/projects/[id]/editor/[sceneId]`, `/projects/[id]/continuity`, `/projects/[id]/consistency`, `/projects/[id]/arcs`, `/projects/[id]/arcs/[arcId]`
- Shared project shell consistency (`+layout.svelte` and child pages)
- Sidebar section behavior, active-state parity, and breadcrumb alignment
- Loader and action consistency for project-scoped data

**Out of scope:**

- Bible/world-building family refactors
- Utility/system routes

## Implementation Steps

1. Align project core pages with shared shell and route contract.
2. Normalize project navigation and active-state logic across deep pages.
3. Enforce approved loader-source patterns and remove mixed-source behaviors.
4. Capture regression evidence for route and interaction parity.

## Files

**Create:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-002-page-family-refactor-execution/phase-001-core-and-knowledge-route-refactors/part-002-refactor-project-workspace-pages/evidence/project-workspace-validation-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-009-app-page-surface-refactor/stage-002-page-family-refactor-execution/phase-001-core-and-knowledge-route-refactors/part-002-refactor-project-workspace-pages/impl.log.md`

## Acceptance Criteria

- [ ] All project core routes conform to shared shell and navigation rules
- [ ] Project active-state behavior remains correct on deep links
- [ ] Loaders use `/api/db/*` pathways for project data

## Edge Cases

- Deep route entry with stale client state
- Cross-route transitions between reader and workspace contexts

## Notes

- Prioritize non-breaking transitions for active project links.
