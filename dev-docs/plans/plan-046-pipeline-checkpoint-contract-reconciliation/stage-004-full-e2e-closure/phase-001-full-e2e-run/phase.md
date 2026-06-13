---
title: Full E2E Run
slug: phase-001-full-e2e-run
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-004-full-e2e-closure
parts:
  - part-001-full-e2e-run
estimated_duration: TBD
---

## Goal

Run the full Chromium e2e suite after contract reconciliation.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Full E2E Run](part-001-full-e2e-run/part.md) | `complete` | Codex | TBD |

## Acceptance Criteria

- [x] Full Chromium e2e suite passes or every remaining failure is a documented blocker.
- [x] No stale checkpoint fixture failures remain.
- [x] Evidence includes exact command and result.

## Notes

Prove route/test reconciliation restores the full e2e baseline.
