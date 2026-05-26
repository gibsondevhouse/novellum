---
title: World Building & Continuity Scaffolding
slug: stage-004-world-building-and-continuity-scaffolding
stage_number: 4
status: complete
owner: Frontend Agent
plan: refactor-004-navigation-and-structure
phases:
  - phase-001-world-building-surface
  - phase-002-continuity-surface
estimated_duration: 2d
risk_level: medium
---

## Goal

Scaffold the World Building and Continuity surfaces with correct routes, module proxy barrels, and sidebar entries. Migrate the Bible entity sub-routes under the new World Building namespace. Redirect the old Consistency route to Continuity. Stub Writing Styles and Prompts sections within the Continuity surface.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [World Building Surface](phase-001-world-building-surface/phase.md) | `draft` | 1d |
| 002 | [Continuity Surface](phase-002-continuity-surface/phase.md) | `draft` | 1d |

## Entry Criteria

- Stage 001 complete: `AppSidebar` Active Project section renders World Building and Continuity nav items
- World Building and Continuity items link to correct not-yet-created routes (404 is acceptable until this stage runs)

## Exit Criteria

- World Building accessible at `/projects/[id]/world-building` with entity sub-routes (characters, locations, lore, plot-threads, timeline)
- Old Bible routes (`/bible/**`) redirect to `/world-building/**` equivalents
- Continuity accessible at `/projects/[id]/continuity`, renders existing consistency issues
- Old Consistency route (`/consistency`) redirects to `/continuity`
- Writing Styles and Prompts visible on Continuity page as stubs
- Both sidebar items reflect active state on their respective routes
- `pnpm run check` exits clean

## Notes

- `src/modules/bible/` is not renamed or deleted. `src/modules/world-building/index.ts` re-exports from it. Full module rename is deferred.
- `src/modules/consistency/` is not renamed or deleted. `src/modules/continuity/index.ts` re-exports from it. Full module rename is deferred.
- The proxy barrel pattern keeps this stage's risk low — existing implementation is untouched; only routes and surface wrappers change.
- World Building entity detail routes (e.g., `/world-building/characters/[charId]`) can initially use the existing Bible page components with updated import paths.
