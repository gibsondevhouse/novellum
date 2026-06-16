---
title: Surface Inventory
slug: phase-001-surface-inventory
phase_number: 1
status: review
owner: Planner Agent
stage: stage-001-artifact-action-contract
parts:
  - part-001-inventory-nova-artifact-actions
  - part-002-define-inline-artifact-action-contract
estimated_duration: 0.5d
---

## Goal

Map the current inline artifact cards, callbacks, and persistence gaps in Nova message history.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Inventory Nova Artifact Actions](part-001-inventory-nova-artifact-actions/part.md) | `review` | Codex | 0.5d |
| 002 | [Define Inline Artifact Action Contract](part-002-define-inline-artifact-action-contract/part.md) | `review` | Codex | 0.5d |

## Acceptance Criteria

- [x] All affected Nova cards and services have source-path ownership notes.
- [x] The plan identifies which actions are currently no-ops, local-only, or durable.
- [x] All parts are in `review` with real Reviewer Agent sign-off still pending.

## Notes

Phase remains draft until execution begins. Add implementation evidence under each part before moving to review.
