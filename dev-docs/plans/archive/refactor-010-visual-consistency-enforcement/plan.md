---
title: Visual Consistency Enforcement
slug: refactor-010-visual-consistency-enforcement
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-04-14
last_updated: 2026-04-14
target_completion: 2026-04-28
completed_at: 2026-04-14
track: Refactor
stages:
  - stage-001-visual-contract-baseline
  - stage-002-enforcement-automation-and-remediation
  - stage-003-quality-gates-and-governance
dependencies:
  - refactor-006-frontend-production-readiness
  - refactor-007-ui-surface-consistency
  - refactor-009-app-page-surface-refactor
quality_gates:
  - lint
  - typecheck
  - tests
  - boundaries
  - visual_regression
  - token_primitive_compliance
  - route_visual_parity
  - ui_surface_inventory_complete
  - ui_surface_compliance_100
---

## Objective

Enforce visual consistency across every Novellum UI surface through a single visual contract, automated checks, and mandatory release gates.

## Scope

**In scope:**

- Exhaustive UI-surface inventory for all page/layout route surfaces under `src/routes/**`
- Route-family visual contract for library, reader, project core, bible/world-building, and utility surfaces
- Typography, spacing, shell, and primitive consistency criteria
- Static enforcement for token and primitive violations
- Visual regression baselines and thresholded diff checks
- CI and reviewer governance for ongoing consistency enforcement

**Out of scope:**

- New token creation or design language expansion
- Backend/API or SQLite schema refactors
- New product features unrelated to visual consistency

## Stages

|#|Stage|Status|Est. Duration|
|---|---|---|---|
|001|[Visual Contract Baseline](stage-001-visual-contract-baseline/stage.md)|`complete`|2d|
|002|[Enforcement Automation and Remediation](stage-002-enforcement-automation-and-remediation/stage.md)|`complete`|4d|
|003|[Quality Gates and Governance](stage-003-quality-gates-and-governance/stage.md)|`complete`|2d|

## Quality Gates

All stages must pass the following gates before this plan is marked `complete`:

- [x] lint - `pnpm run lint` exits 0 (includes boundaries checks)
- [x] typecheck - `pnpm run check` exits 0
- [x] tests - `pnpm run test` exits 0
- [x] boundaries - `eslint-plugin-boundaries` reports zero violations
- [x] visual_regression - baseline diffs pass for all route families in scope
- [x] token_primitive_compliance - no raw token drift or primitive bypasses
- [x] route_visual_parity - route-family parity checks pass in evidence report
- [x] ui_surface_inventory_complete - every route/page/layout surface in `src/routes/**` is tracked in the surface registry
- [x] ui_surface_compliance_100 - registry shows 100% visual-contract compliance (no unreviewed, unclassified, or deferred surfaces)

## Risks & Mitigations

|Risk|Likelihood|Mitigation|
|---|---|---|
|Subjective style debates block progress|medium|Use explicit pass/fail rulebook language and examples|
|Automation misses nuanced drift|medium|Pair static checks with visual snapshots and manual parity checks|
|Gate noise leads to skipped checks|low|Use documented thresholds and mandatory reviewer sign-off|
|Refactors regress route behavior|medium|Include route transition parity checks in every remediation batch|

## Notes

- UI work must remain Svelte 5 rune-compliant (`$state`, `$derived`, `$props`).
- Navigation must use SvelteKit route APIs; avoid direct `window.location` usage.
- This plan enforces consistency using existing design primitives and tokens.
- This plan cannot be marked complete unless all inventoried surfaces are explicitly verified and marked compliant.
