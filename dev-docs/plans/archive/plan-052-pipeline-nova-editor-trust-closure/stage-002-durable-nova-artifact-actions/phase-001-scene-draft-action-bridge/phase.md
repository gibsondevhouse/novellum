---
title: Scene Draft Action Bridge
slug: phase-001-scene-draft-action-bridge
phase_number: 1
status: review
owner: Planner Agent
stage: stage-002-durable-nova-artifact-actions
parts:
  - part-001-persist-inline-scene-drafts-as-review-artifacts
  - part-002-wire-scene-draft-actions-in-message-log
estimated_duration: 1.5d
---

## Goal

Wire inline scene draft Accept/Reject to a durable checkpoint or explicit safe fallback.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Persist Inline Scene Drafts As Review Artifacts](part-001-persist-inline-scene-drafts-as-review-artifacts/part.md) | `review` | Codex | 1d |
| 002 | [Wire Scene Draft Actions In Message Log](part-002-wire-scene-draft-actions-in-message-log/part.md) | `review` | Codex | 0.5d |

## Acceptance Criteria

- [x] Accept either creates/uses a checkpoint and applies through existing review gates or blocks with clear insufficient-context copy.
- [x] Reject records durable review state where a checkpoint or artifact identity exists.
- [x] All parts are in `review` with real Reviewer Agent sign-off still pending.

## Notes

Phase implementation is in `review` pending real Reviewer Agent sign-off. Evidence is recorded under each part.
