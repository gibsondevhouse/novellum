---
title: Failing Spec Classification
slug: phase-003-failing-spec-classification
phase_number: 3
status: draft
owner: Planner Agent
stage: stage-001-contract-and-test-audit
parts:
  - part-001-failing-spec-classification
estimated_duration: TBD
---

## Goal

Classify each full-e2e failure as stale test, product regression, or retired contract.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Failing Spec Classification](part-001-failing-spec-classification/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Every failing spec has a classification and recommended action.
- [ ] Stale fixture failures are distinguished from product regressions.
- [ ] Next-stage API map can resolve each failure.

## Notes

Prevent stale tests from driving accidental compatibility while still catching real regressions.
