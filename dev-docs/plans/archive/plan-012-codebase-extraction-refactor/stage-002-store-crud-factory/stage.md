---
title: Store CRUD Factory
slug: stage-002-store-crud-factory
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-012-codebase-extraction-refactor
phases:
  - phase-001-create-crud-factory
  - phase-002-verify-stores
estimated_duration: 1d
risk_level: medium
---

## Goal

> Create a generic Svelte 5 store CRUD factory that generates reactive state (`$state`), getters, and CRUD actions for any entity type. Use it to collapse `bible-crud.svelte.ts` from 420 lines to ~60 lines, eliminating 5× repeated boilerplate for Character, Location, LoreEntry, PlotThread, and TimelineEvent.

## Phases

| # | Phase | Status | Est. Duration |
|---|-------|--------|---------------|
| 001 | [Create CRUD Factory & Migrate](phase-001-create-crud-factory/phase.md) | `complete` | 0.75d |
| 002 | [Verify Stores](phase-002-verify-stores/phase.md) | `complete` | 0.25d |

## Entry Criteria

- Stage 001 (Repository Factory) is `complete` (bible stores depend on repositories)
- `pnpm check` passes

## Exit Criteria

- `bible-crud.svelte.ts` refactored to use factory
- All CRUD operations still work for all 6 bible entities
- `pnpm check` — 0 errors
- `pnpm run lint` — 0 new errors
- Browser test: bible pages (characters, locations, lore, plot threads, timeline) all work

## Notes

> The CRUD factory must use Svelte 5 `$state` runes. It will be a `.svelte.ts` file so the compiler processes the runes correctly.
>
> The existing `bible-crud.svelte.ts` manages 6 entities (Character, Relationship, Location, LoreEntry, PlotThread, TimelineEvent). Relationship has a simpler pattern (no saving/error state) — the factory should support both full and lite modes.
>
> The factory depends on repository functions from Stage 1. If those are not yet migrated, the factory can still use the original repository imports.
