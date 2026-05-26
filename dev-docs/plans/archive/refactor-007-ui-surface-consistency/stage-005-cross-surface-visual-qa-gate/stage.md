---
title: Cross-Surface Visual QA Gate
slug: stage-005-cross-surface-visual-qa-gate
stage_number: 5
status: complete
owner: Planner Agent
plan: refactor-007-ui-surface-consistency
phases:
  - phase-001-final-visual-regression-and-gate
estimated_duration: 2d
risk_level: medium
---

## Goal

Run final cross-surface QA and quality gates to verify coherent styling, stable navigation, and regression-free rollout across all audited routes.

## Phases

| #   | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Final Visual Regression & Gate](phase-001-final-visual-regression-and-gate/phase.md) | `draft` | 2d |

## Entry Criteria

- Stages 001 through 004 are complete.
- Evidence artifacts are present for every prior stage part.

## Exit Criteria

- Every required surface passes manual visual QA.
- pnpm run lint, pnpm run check, and pnpm run test all exit 0.
- Plan evidence packet is complete and ready for review sign-off.

## Notes

This is the mandatory release gate for the refactor; failures reopen upstream parts.
