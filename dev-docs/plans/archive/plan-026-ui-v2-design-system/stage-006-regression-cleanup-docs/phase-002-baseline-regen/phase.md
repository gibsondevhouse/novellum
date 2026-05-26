---
title: Playwright Baseline Regeneration
slug: phase-002-baseline-regen
phase_number: 2
status: complete
owner: Reviewer Agent
stage: stage-006-regression-cleanup-docs
parts:
  - part-001-regen
estimated_duration: 0.5d
---

## Goal

Regenerate visual-regression baselines against the v2 UI, remove stale pre-`snapshotPathTemplate` screenshots, and verify the visual suite is green without `--update-snapshots`.

## Parts

| #   | Part                                        | Status     |
| --- | ------------------------------------------- | ---------- |
| 001 | [Baseline regen + stale cleanup](part-001-regen/part.md) | `complete` |

## Acceptance Criteria

- [x] Visual failures triaged into Bucket A (snapshot diffs) vs Bucket B (test errors)
- [x] Blocking Bucket B failure fixed before regen
- [x] Dead baseline directory removed
- [x] `pnpm exec playwright test tests/visual/ --update-snapshots` passes
- [x] `pnpm exec playwright test tests/visual/` passes after regen
- [x] Evidence artifact added under phase part `evidence/`

## Notes

The previous `editor-nova-panel-tools` test imported `/src/modules/nova/index.ts` from `page.evaluate()`, which only works under `pnpm dev`. A runtime hook was exposed from the Nova module barrel so the same test can seed tool-call/tool-result messages under preview mode.
