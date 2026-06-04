---
title: CSS Lint Fix & Visual Baseline
slug: stage-002-css-visual
stage_number: 2
status: draft
owner: Planner Agent
plan: plan-042-quality-gates-closure
phases:
  - phase-001-css-lint
  - phase-002-visual-snapshot
estimated_duration: 1d
risk_level: medium
---

## Goal

Fix the pre-existing `lint:css` error in `IndividualsWorkspaceShell.svelte:183` and establish
a stable Playwright visual snapshot baseline for future regression detection.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [CSS Lint Fix](phase-001-css-lint/phase.md) | `draft` | 0.25d |
| 002 | [Visual Snapshot Baseline](phase-002-visual-snapshot/phase.md) | `draft` | 0.75d |

## Entry Criteria

- Stage-001 (TypeScript warnings) is complete
- All lint:css errors documented
- Playwright environment operational

## Exit Criteria

- All phases complete
- `pnpm lint:css` runs with zero errors
- Visual snapshot baseline established or formally documented
- All quality gates passed

## Notes

Visual snapshots may have drifted across the UI surface since plan-030. The goal here is to
stabilize the baseline, not necessarily to achieve perfect visual consistency. Document any
known divergences that will be addressed in future design-focused plans.
