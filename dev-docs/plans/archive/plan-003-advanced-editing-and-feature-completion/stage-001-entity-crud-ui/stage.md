---
title: Entity CRUD UI
slug: stage-001-entity-crud-ui
stage_number: 1
status: complete
owner: Frontend Agent
plan: plan-003-advanced-editing-and-feature-completion
phases:
  - phase-001-project-hub-ui
  - phase-002-story-bible-ui
  - phase-003-outliner-ui
estimated_duration: 8d
---

## Goal

Build every data-entry and data-browsing view that the user needs to manage their novel's structure and world-building entities. This stage wires the plan-002 repository layer directly into real Svelte components, giving users a fully navigable application for the first time.

## Phases

| #   | Phase                                               | Status     |
| --- | --------------------------------------------------- | ---------- |
| 001 | [Project Hub UI](phase-001-project-hub-ui/phase.md) | `complete` |
| 002 | [Story Bible UI](phase-002-story-bible-ui/phase.md) | `complete` |
| 003 | [Outliner UI](phase-003-outliner-ui/phase.md)       | `complete` |

## Entry Criteria

- plan-002 complete: all repositories available and Vitest-tested
- `src/modules/` directory structure established per `dev-docs/modular-boundaries.md`
- `src/lib/stores/active-project.ts` and `ai-panel.ts` exist (from plan-002)

## Exit Criteria

- User can create, view, edit, and delete a project
- User can manage all Story Bible entities (Characters, Locations, Lore, Plot Threads, Timeline Events)
- User can build and reorder a chapter/scene/beat outline
- All new components pass `pnpm run lint`, `pnpm run check`, and `pnpm run test`
- All new `+page.svelte` files are ≤150 lines (hard limit per `modular-boundaries.md`)

## Technical Notes

- All data mutations go through the repository layer (`src/modules/<domain>/services/`)
- No direct Dexie calls from `+page.svelte` or component files
- Module public API must be re-exported through `src/modules/<domain>/index.ts`
- Use Svelte 5 `$state` / `$derived` for all reactive UI state; no legacy writable stores
