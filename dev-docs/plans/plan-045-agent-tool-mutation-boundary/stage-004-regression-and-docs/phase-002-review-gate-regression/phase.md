---
title: Review Gate Regression
slug: phase-002-review-gate-regression
phase_number: 2
status: review
owner: Planner Agent
stage: stage-004-regression-and-docs
parts:
  - part-001-review-gate-regression
estimated_duration: TBD
---

## Goal

Prove author review gates still apply manuscript/canon changes only after explicit UI action.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Review Gate Regression](part-001-review-gate-regression/part.md) | `review` | Codex | TBD |

## Acceptance Criteria

- [x] Explicit UI accept can still apply valid drafts.
- [x] Model-callable paths cannot apply drafts.
- [x] Stale/dirty/force-overwrite protections remain intact.

## Notes

Verify the mutation boundary preserves existing checkpoint and proposal acceptance UX.
