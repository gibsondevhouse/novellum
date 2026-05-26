---
title: Hierarchy QA & Tests
slug: stage-005-hierarchy-qa-and-tests
stage_number: 5
status: complete
owner: Reviewer Agent
plan: plan-013-workspace-hierarchy-flow
phases: []
estimated_duration: 1d
risk_level: low
---

## Goal

Prove the Arc → Act → Chapter → Scene flow is correct end-to-end, locked behind automated regression coverage, and that boundary, token, and a11y gates remain green.

## Phases

> Suggested decomposition:
>
> - phase-001-repository-and-store-coverage — verify Vitest coverage ≥ 80% lines on `act-repository.ts` and `hierarchy-store.svelte.ts`; backfill any gaps surfaced by `pnpm run test:coverage`.
> - phase-002-component-render-tests — Vitest component tests for `ArcCard`, `ActCard`, `ChapterCard`, `HierarchyBreadcrumb` (render, click, ARIA).
> - phase-003-e2e-arc-flow — `tests/e2e/arc-hierarchy-flow.spec.ts` Playwright spec: from a fresh project, create Arc → create Act → create Chapter → create Scene → reload → assert hierarchy persists.
> - phase-004-docs-sync — update `dev-docs/data-model.md` (hierarchy section) and `dev-docs/routing-context.md` (new routes) to reflect the shipped surface.
> - phase-005-final-gate-run — execute `pnpm run lint && pnpm run check && pnpm run test && pnpm run check:tokens && pnpm run test:visual && pnpm run build`; capture output in `evidence/`.

## Entry Criteria

- Stages 001–004 complete; all routes and components shipped.

## Exit Criteria

- `pnpm run test:coverage` reports ≥ 80% line coverage on:
  - `src/modules/project/services/act-repository.ts`
  - `src/modules/project/stores/hierarchy-store.svelte.ts`
- Component tests pass for the five new card/breadcrumb components.
- `tests/e2e/arc-hierarchy-flow.spec.ts` passes locally and in CI.
- `dev-docs/data-model.md` describes the Arc → Act → Chapter → Scene hierarchy and the unassigned-grouping contract.
- `dev-docs/routing-context.md` lists the new arc detail / act detail / chapter detail routes.
- Final gate run output is checked into `evidence/` and the plan flips to `complete`.

## Notes

- e2e test should not depend on AI calls or external network. Use `OFFLINE=1` or the existing test-mode flag if one exists.
- Coverage gate is on the new files only; the broader project's coverage threshold is a separate concern.
- Reviewer Agent owns this stage. Stylist consults on a11y issues surfaced by component tests.
