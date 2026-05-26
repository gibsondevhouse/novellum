---
title: Baseline regen + stale screenshot cleanup
slug: part-001-regen
part_number: 1
status: complete
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-002-baseline-regen
started_at: 2026-05-25
completed_at: 2026-05-25
estimated_duration: 0.5d
---

## Objective

Bring visual baselines in sync with plan-026 v2 styling, while ensuring no failing test remains hidden behind a blind snapshot rewrite.

## Scope

**In scope:**

- Pre-regen gates (`check:tokens`, `check`, `lint`, `lint:css`, `test`)
- Visual failure triage and blocking-failure remediation
- Dead baseline directory cleanup
- Snapshot regeneration and post-regen verification

**Out of scope:**

- E2E flow stabilization outside `tests/visual/*`
- Plan rollup/status promotion beyond phase-002

## Implementation Steps

1. Run pre-regen gates and capture baseline inventory.
2. Run `playwright test tests/visual/` and classify failures.
3. Fix Bucket B blocker in `editor-nova-panel-tools.test.ts`.
4. Delete stale `tests/visual/__screenshots__/visual-regression.test.ts/` folder.
5. Regenerate snapshots and verify green without update mode.
6. Record diff evidence.

## Files

**Update:**

- `tests/visual/editor-nova-panel-tools.test.ts`
- `src/modules/nova/index.ts`
- `tests/visual/__screenshots__/visual/*`

**Delete:**

- `tests/visual/__screenshots__/visual-regression.test.ts/*`

## Acceptance Criteria

- [x] `pnpm exec playwright test tests/visual/ --update-snapshots` passes
- [x] `pnpm exec playwright test tests/visual/` passes after regen
- [x] No stale pre-path-template screenshot directory remains
- [x] Evidence file added

## Notes

The runtime test hook is intentionally minimal and only exposes session mutation needed by the visual test harness.
