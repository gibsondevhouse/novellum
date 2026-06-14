---
title: Queue Schema & Claiming
slug: phase-001-queue-schema-and-claiming
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-003-local-job-execution
parts:
  - part-001-queue-schema-and-claiming
estimated_duration: TBD
---

## Goal

Add local job queue persistence and atomic claiming semantics.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Queue Schema & Claiming](part-001-queue-schema-and-claiming/part.md) | `complete` | Codex | TBD |

## Acceptance Criteria

- [x] Jobs can be enqueued with project, run, type, priority, payload, and scheduled time.
- [x] Claiming is atomic and handles stale claims safely.
- [x] Tests cover enqueue, claim, heartbeat, cancel, retry scheduling, and stale worker recovery.

## Notes

This phase provides the persistence mechanics. It should not run AI work yet.
