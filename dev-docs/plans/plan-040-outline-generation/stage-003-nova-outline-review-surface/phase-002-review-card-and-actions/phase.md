---
title: Review Card & Actions
slug: phase-002-review-card-and-actions
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-003-nova-outline-review-surface
parts:
  - part-001-build-outline-review-card
  - part-002-implement-review-actions
  - part-003-add-nova-state-empty-failure-conflict-polish
estimated_duration: 1.5d
---

## Goal

Render the proposed outline and provide explicit accept/reject actions with source and conflict visibility.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Build Outline Review Card](part-001-build-outline-review-card/part.md) | `complete` | Frontend Agent | 0.5d |
| 002 | [Implement Review Actions](part-002-implement-review-actions/part.md) | `complete` | Frontend Agent | 0.5d |
| 003 | [Add Nova Empty, Failure, and Conflict Polish](part-003-add-nova-state-empty-failure-conflict-polish/part.md) | `complete` | Stylist Agent | 0.5d |

## Acceptance Criteria

- [x] All parts reach `complete` with evidence artifacts.
- [x] Phase implementation remains inside declared repo/module boundaries.
- [x] Any deviation from planned files is documented in the relevant `impl.log.md`.
- [x] Required tests for the phase pass or have a reviewer-approved waiver.

## Notes

Treat this phase as blocked if an upstream contract is missing or contradicts current source. Source code wins over stale documentation; capture the mismatch in evidence before proceeding.
