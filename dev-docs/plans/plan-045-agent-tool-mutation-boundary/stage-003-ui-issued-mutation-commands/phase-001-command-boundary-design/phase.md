---
title: Command Boundary Design
slug: phase-001-command-boundary-design
phase_number: 1
status: review
owner: Planner Agent
stage: stage-003-ui-issued-mutation-commands
parts:
  - part-001-command-boundary-design
estimated_duration: TBD
---

## Goal

Design the UI-issued command boundary for checkpoint and proposal mutations.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Command Boundary Design](part-001-command-boundary-design/part.md) | `review` | — | TBD |

## Acceptance Criteria

- [x] Mutation command ownership is explicit by pipeline family.
- [x] UI buttons remain the accept/reject source of truth.
- [x] Server-side stale guards remain in place.

## Notes

Separate model-generated review artifacts from explicit author accept/reject commands.
