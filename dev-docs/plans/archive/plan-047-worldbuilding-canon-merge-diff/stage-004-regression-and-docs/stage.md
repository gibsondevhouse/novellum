---
title: Regression & Docs
slug: stage-004-regression-and-docs
stage_number: 4
status: complete
owner: Planner Agent
plan: plan-047-worldbuilding-canon-merge-diff
phases:
  - phase-001-proposal-flow-tests
  - phase-002-canon-merge-tests
  - phase-003-docs-sync
estimated_duration: TBD
risk_level: medium
---

## Goal

Verify worldbuilding diff/merge behavior and document the new canon acceptance guarantees.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Proposal Flow Tests](phase-001-proposal-flow-tests/phase.md) | `complete` | TBD |
| 002 | [Canon Merge Tests](phase-002-canon-merge-tests/phase.md) | `complete` | TBD |
| 003 | [Docs Sync](phase-003-docs-sync/phase.md) | `complete` | TBD |

## Entry Criteria

- Review UI, merge routes, and audit writes are implemented.

## Exit Criteria

- Required quality gates pass.
- Tests cover create, update/merge, duplicate evidence, accept, and reject behavior.
- Worldbuilding and AI pipeline docs describe diff/merge review semantics.

## Notes

This stage should include evidence that existing insert-only proposals still work where create is the correct decision.
