---
title: App Page Surface Refactor
slug: refactor-009-app-page-surface-refactor
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-14
last_updated: 2026-04-14
target_completion: 2026-04-22
track: Refactor
stages:
  - stage-001-route-contract-and-foundations
  - stage-002-page-family-refactor-execution
  - stage-003-validation-and-rollout
dependencies:
  - refactor-006-frontend-production-readiness
  - refactor-007-ui-surface-consistency
  - linearization-overhaul
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - route_parity
  - visual_qa
  - loader_source_consistency
---

## Objective

Refactor Novellum page surfaces to a consistent route-family architecture using the standards from refactor-006, refactor-007, and linearization-overhaul, with enforceable quality gates and explicit data-loading discipline.

## Scope

**In scope:**

- Route-family refactor for library, reader, project, bible/world-building, and utility pages
- Page-level shell and layout consistency across `src/routes/**`
- Svelte 5 runes enforcement in page and route-adjacent state patterns
- Navigation and active-state consistency across sidebar and deep routes
- Loader-source consistency (`/api/db/*` for project-backed data; no Dexie route-loader reads)
- Cross-surface QA with lint, typecheck, tests, boundaries, and manual route verification

**Out of scope:**

- New product features or module-level capability expansion
- Backend API redesign or SQLite schema changes
- New design-token creation or style-system expansion beyond existing primitives
- Dexie usage outside portability import/export workflows

## Stages

|#|Stage|Status|Est. Duration|
|---|---|---|---|
|001|[Route Contract and Foundations](stage-001-route-contract-and-foundations/stage.md)|`complete`|2d|
|002|[Page-Family Refactor Execution](stage-002-page-family-refactor-execution/stage.md)|`complete`|4d|
|003|[Validation and Rollout](stage-003-validation-and-rollout/stage.md)|`complete`|2d|

## Quality Gates

All stages must pass the following gates before this plan is marked `complete`:

- [x] **lint** - `pnpm run lint` exits 0 (includes boundaries checks)
- [x] **typecheck** - `pnpm run check` exits 0
- [x] **tests** - `pnpm run test` exits 0
- [x] **boundaries** - `eslint-plugin-boundaries` reports zero violations
- [x] **route_parity** - all declared route families render and navigate correctly
- [x] **visual_qa** - cross-surface visual consistency evidence captured
- [x] **loader_source_consistency** - route loaders use approved server-side data access paths (`/api/db/*`)

## Risks & Mitigations

|Risk|Likelihood|Mitigation|
|---|---|---|
|Page-family scope drift causes uneven rollout|medium|Use route-family acceptance checklists and lock stage boundaries|
|Loader regressions from mixed data sources|high|Require explicit API-based loader verification and route-level evidence|
|UI consistency refactor introduces interaction regressions|medium|Run page-family visual QA and targeted navigation scenarios each phase|
|Deep route active-state mismatches reappear|medium|Enforce sidebar/nav parity checks in Stage 003 validation suite|

## Notes

- All page refactors must follow Svelte 5 runes (`$state`, `$derived`, `$props`) and current Novellum composition patterns.
- Page data loading must target server-side SQLite through `/api/db/*` APIs; Dexie remains limited to portability (`.novellum.zip`) flows.
- This plan operationalizes prior completed plans without reopening their original implementation scopes.
