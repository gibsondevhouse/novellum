---
title: Repository Factory
slug: stage-001-repository-factory
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-012-codebase-extraction-refactor
phases:
  - phase-001-create-factory
  - phase-002-verify-repositories
estimated_duration: 2d
risk_level: medium
---

## Goal

> Create a generic repository factory function in `src/lib/factories/` that eliminates the repeated CRUD boilerplate across 18 repository files. Each repository currently implements 5–8 nearly-identical functions (create, getById, getByProjectId, update, remove, reorder) that differ only in endpoint URL and entity type.

## Phases

| # | Phase | Status | Est. Duration |
|---|-------|--------|---------------|
| 001 | [Create Factory & Migrate](phase-001-create-factory/phase.md) | `draft` | 1.5d |
| 002 | [Verify Repositories](phase-002-verify-repositories/phase.md) | `draft` | 0.5d |

## Entry Criteria

> What must be true before this stage can begin.

- Plan status is `draft` or `in-progress`
- Dev environment is ready (`pnpm check` passes)

## Exit Criteria

> What must be true for this stage to be marked `complete`.

- All 18 repository files refactored to use the factory
- All phases complete
- `pnpm check` — 0 type errors
- `pnpm run lint` — 0 new lint errors
- `pnpm run test` — all existing tests pass
- `eslint-plugin-boundaries` passes

## Notes

> The 18 repositories fall into 3 tiers of complexity:
>
> **Tier 1 — Standard CRUD (13 files, ~25–30 lines each):** project, location, plot-thread, timeline-event, chat-instruction, system-prompt, template, writing-style, consistency, export-settings, arc, lore-entry, chapter
>
> **Tier 2 — CRUD + Reorder (4 files, ~34–37 lines each):** beat, scene, stage, chapter (already in Tier 1 but has reorder)
>
> **Tier 3 — CRUD + Custom Methods (1 file, ~41 lines):** character (includes relationship CRUD)
>
> The factory must support Tier 1 and 2 natively. Tier 3 repositories extend the factory with additional custom methods.
