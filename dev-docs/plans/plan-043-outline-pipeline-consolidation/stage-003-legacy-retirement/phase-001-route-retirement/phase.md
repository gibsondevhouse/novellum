---
title: Route Retirement
slug: phase-001-route-retirement
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-003-legacy-retirement
parts:
  - part-001-route-retirement
estimated_duration: TBD
---

## Goal

Remove or hard-disable the legacy direct outline apply route.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Route Retirement](part-001-route-retirement/part.md) | `complete` | Codex | TBD |

## Acceptance Criteria

- [x] Legacy route no longer performs hierarchy replacement.
- [x] No active caller expects the retired route.
- [x] Failure behavior is explicit if the route remains as unsupported.

## Notes

Retire `/api/nova/outline/apply` so generated outlines cannot replace hierarchy outside checkpoint acceptance.
