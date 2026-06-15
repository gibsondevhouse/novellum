---
title: Proposal Flow Tests
slug: phase-001-proposal-flow-tests
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-004-regression-and-docs
parts:
  - part-001-proposal-flow-tests
estimated_duration: TBD
---

## Goal

Cover the proposal review flow with diff-aware tests.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Proposal Flow Tests](part-001-proposal-flow-tests/part.md) | `complete` | Codex | TBD |

## Acceptance Criteria

- [x] Create-only proposals still work.
- [x] Diff-aware proposals require explicit accept.
- [x] Reject preserves reason and does not mutate canon.

## Notes

Ensure create/update/merge/reject proposal behavior remains review-gated and stable.
