---
title: Wire Accept/Reject Mutations
slug: phase-001-wire-accept-reject-mutations
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-004-accept-reject-canon-safety
parts:
  - part-001-connect-auditable-accept-reject-paths
estimated_duration: 0.75d
---

## Goal

Wire Accept/Reject Mutations for plan-037 while preserving review-gated canon safety.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Connect Auditable Accept/Reject Paths](part-001-connect-auditable-accept-reject-paths/part.md) | `complete` | Claude Code | 0.75d |

## Acceptance Criteria

- [x] accept/reject routes through existing API/checkpoint boundaries
- [x] audit metadata and lifecycle transitions persist consistently

## Notes

This phase should remain scoped to the parent stage only and avoid cross-stage spillover.
