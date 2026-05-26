---
title: World Building Surface
slug: phase-001-world-building-surface
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-004-world-building-and-continuity-scaffolding
parts:
  - part-001-world-building-route-scaffold
  - part-002-world-building-entity-migration
estimated_duration: 1d
---

## Goal

Create the `/projects/[id]/world-building` route with a landing hub page and all entity sub-routes (characters, locations, lore, plot-threads, timeline). Create the `src/modules/world-building/` module as a proxy barrel. Redirect all `/bible/**` routes to their `/world-building/**` equivalents.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [World Building Route Scaffold](part-001-world-building-route-scaffold/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [World Building Entity Migration](part-002-world-building-entity-migration/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] `src/routes/projects/[id]/world-building/+page.svelte` renders a section grid (character, location, lore, plot-threads, timeline cards)
- [ ] Each entity type has a sub-route under `/world-building/` (list and detail)
- [ ] All `/projects/[id]/bible/**` routes redirect to `/projects/[id]/world-building/**` equivalents
- [ ] `src/modules/world-building/index.ts` exists and re-exports from `src/modules/bible/`
- [ ] World Building sidebar item shows active state on all `/world-building` sub-routes
- [ ] `pnpm run check` exits clean

## Notes

- `src/modules/bible/` is not deleted or renamed in this stage — the proxy barrel keeps the existing components working
- The World Building landing page (`+page.svelte`) reuses the visual pattern from the existing Bible landing page (section cards grid) — do not redesign it; just re-implement the routing
- Entity detail sub-routes (e.g., `/world-building/characters/[charId]`) can initially render the same components as the Bible equivalents
