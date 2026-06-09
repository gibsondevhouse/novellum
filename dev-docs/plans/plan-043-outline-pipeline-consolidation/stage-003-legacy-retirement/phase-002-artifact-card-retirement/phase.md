---
title: Artifact Card Retirement
slug: phase-002-artifact-card-retirement
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-003-legacy-retirement
parts:
  - part-001-artifact-card-retirement
estimated_duration: TBD
---

## Goal

Retire the legacy `NovaOutlineCard` apply behavior and any associated service calls.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Artifact Card Retirement](part-001-artifact-card-retirement/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] No visible legacy outline card button can apply hierarchy changes.
- [ ] Supported outline checkpoint cards still work.
- [ ] Exports do not expose retired mutation helpers unnecessarily.

## Notes

Remove the UI affordance that applies legacy `author-outline` artifacts to the outline board.
