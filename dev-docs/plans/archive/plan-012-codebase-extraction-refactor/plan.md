---
title: Codebase Extraction Refactor
slug: plan-012-codebase-extraction-refactor
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-16
last_updated: 2026-04-16
target_completion: 2026-04-30
stages:
  - stage-001-repository-factory
  - stage-002-store-crud-factory
  - stage-003-api-route-helpers
  - stage-004-module-extraction
  - stage-005-barrel-cleanup
dependencies: []
quality_gates:
  - lint
  - typecheck
  - tests
  - boundary_check
---

## Objective

> Systematically eliminate duplicated constants, types, entity creation boilerplate, repository patterns, store CRUD patterns, and API route handlers across the entire Novellum codebase. Establish shared factory functions, typed constants, and utility helpers following the workspace module's gold-standard extraction pattern (`constants.ts`, `types.ts`, `factories.ts`, `utils.ts`). Estimated ~1,700 lines of boilerplate eliminated.

## Scope

**In scope:**

- Repository factory (`src/lib/factories/`) to generalize 18 nearly-identical repository files
- Store CRUD factory to collapse `bible-crud.svelte.ts` (420 lines → ~60 lines)
- API route POST handler helper to standardize 14+ `+server.ts` creation endpoints
- Module-level extraction for outliner, bible, editor, AI, project, consistency, settings, and export modules (constants, types, factories, utils)
- Barrel file (`index.ts`) completeness audit and repair for all modules and `$lib/components`
- Deduplication of `BeatFocus` type (4 outliner files), form callback types (4 bible files), and scattered constants

**Out of scope:**

- Component decomposition (large `.svelte` files) — separate plan
- Store pattern standardization (class vs function) — separate plan
- New feature work or UI changes
- Test coverage expansion beyond verifying non-regression

## Stages

| #   | Stage                                                                               | Status     | Est. Duration |
| --- | ----------------------------------------------------------------------------------- | ---------- | ------------- |
| 001 | [Repository Factory](stage-001-repository-factory/stage.md)                         | `complete` | 2d            |
| 002 | [Store CRUD Factory](stage-002-store-crud-factory/stage.md)                         | `complete` | 1d            |
| 003 | [API Route Helpers](stage-003-api-route-helpers/stage.md)                           | `complete` | 2d            |
| 004 | [Module-Level Extraction](stage-004-module-extraction/stage.md)                     | `complete` | 3d            |
| 005 | [Barrel Exports & Final Cleanup](stage-005-barrel-cleanup/stage.md)                 | `complete` | 1d            |

## Quality Gates

All stages must pass the following gates before the plan is marked `complete`:

- [ ] **lint** — zero lint errors (`pnpm run lint`)
- [ ] **typecheck** — zero type errors (`pnpm check`)
- [ ] **tests** — all tests pass (`pnpm run test`)
- [ ] **boundary_check** — `eslint-plugin-boundaries` passes (no FSD/VSA module leakage)
- [ ] **no regressions** — browser smoke test of workspace, editor, bible, outliner, project hub, and settings pages

## Risks & Mitigations

| Risk                                                | Likelihood | Mitigation                                                                                  |
| --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| Repository factory generic type doesn't fit all 18  | Medium     | Allow per-repo overrides; factory returns base + entity-specific methods can be added        |
| API helper doesn't cover all POST variations        | Medium     | Helper covers 80% case; complex endpoints (scenes, characters) keep custom logic             |
| Boundary violations from new `$lib/factories/`      | Low        | Pre-validate with `eslint-plugin-boundaries` after each stage                                |
| Store CRUD factory breaks Svelte 5 reactivity       | Medium     | Verify `$state` reactivity preserved with browser test after migration                       |
| HMR cache staleness during incremental migration    | Low        | Full page reload after each part; document in checklists                                     |

## Quantified Impact

| Extraction Target          | Files Affected | Lines Eliminated | Lines Added |
| -------------------------- | -------------- | ---------------- | ----------- |
| Repository Factory         | 18             | ~400             | ~80         |
| Store CRUD Factory         | 1 (420→60)     | ~360             | ~80         |
| API Route Helpers          | 14             | ~280             | ~60         |
| Module Constants/Types     | ~25            | ~200             | ~120        |
| Barrel File Repairs        | ~8             | 0                | ~60         |
| **Total**                  | **~66**        | **~1,240**       | **~400**    |

**Net reduction: ~840 lines of boilerplate.**

## Notes

> This plan was informed by a two-pass exhaustive audit of all modules, routes, services, stores, and components. The workspace module (`src/modules/workspace/`) serves as the reference implementation for the extraction pattern. Each stage is independently valuable — partial completion still delivers meaningful deduplication.
>
> Svelte 5 runes (`$state`, `$derived`, `$effect`, `.svelte.ts`) must be used for all store work. No Svelte 4 patterns.
>
> All repository files use the fetch-based API client pattern (calling `/api/db/*` endpoints), NOT direct SQLite access. The factory must preserve this architecture.
