---
title: Worker Lifecycle & Retry
slug: phase-002-worker-lifecycle-and-retry
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-003-local-job-execution
parts:
  - part-001-worker-lifecycle-and-retry
estimated_duration: TBD
---

## Goal

Implement local worker behavior for queued agent jobs with cancellation, retry, progress, and recovery.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Worker Lifecycle & Retry](part-001-worker-lifecycle-and-retry/part.md) | `complete` | Codex | TBD |

## Acceptance Criteria

- [x] Worker execution updates job and run state consistently.
- [x] Cancellation, retry, and failure behavior is deterministic and user-visible.
- [x] Long-running outline, author draft, and worldbuilding runs can be moved behind the worker contract without bypassing review gates.

## Notes

This phase should make execution durable without making mutation automatic.
