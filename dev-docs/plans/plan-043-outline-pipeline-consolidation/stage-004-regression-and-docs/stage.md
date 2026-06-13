---
title: Regression & Docs
slug: stage-004-regression-and-docs
stage_number: 4
status: complete
owner: Planner Agent
plan: plan-043-outline-pipeline-consolidation
phases:
  - phase-001-targeted-regression
  - phase-002-docs-sync
  - phase-003-closeout-evidence
estimated_duration: TBD
risk_level: medium
---

## Goal

Prove the consolidated outline flow is stable and update docs so future agents do not reintroduce the legacy path.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Targeted Regression](phase-001-targeted-regression/phase.md) | `complete` | TBD |
| 002 | [Docs Sync](phase-002-docs-sync/phase.md) | `complete` | TBD |
| 003 | [Closeout Evidence](phase-003-closeout-evidence/phase.md) | `complete` | TBD |

## Entry Criteria

- Legacy path retirement is complete.
- Canonical checkpoint flow is wired through user-facing entrypoints.

## Exit Criteria

- Required quality gates pass.
- Outline generation review e2e coverage passes.
- Developer and AI pipeline docs identify the canonical outline path and retired legacy behavior.

## Notes

At minimum, verify `pnpm check`, `pnpm lint`, `pnpm lint:css`, `pnpm test`, `pnpm check:tokens`, and targeted outline e2e coverage.
