---
title: Route Retirement
slug: phase-001-route-retirement
phase_number: 1
status: draft
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
| 001 | [Route Retirement](part-001-route-retirement/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Legacy route no longer performs hierarchy replacement.
- [ ] No active caller expects the retired route.
- [ ] Failure behavior is explicit if the route remains as unsupported.

## Notes

Retire `/api/nova/outline/apply` so generated outlines cannot replace hierarchy outside checkpoint acceptance.
