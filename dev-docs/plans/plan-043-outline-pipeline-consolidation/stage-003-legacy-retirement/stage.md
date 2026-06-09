---
title: Legacy Retirement
slug: stage-003-legacy-retirement
stage_number: 3
status: draft
owner: Planner Agent
plan: plan-043-outline-pipeline-consolidation
phases:
  - phase-001-route-retirement
  - phase-002-artifact-card-retirement
  - phase-003-compatibility-notes
estimated_duration: TBD
risk_level: high
---

## Goal

Remove or hard-disable the legacy outline artifact apply route and UI after canonical checkpoint coverage is in place.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Route Retirement](phase-001-route-retirement/phase.md) | `draft` | TBD |
| 002 | [Artifact Card Retirement](phase-002-artifact-card-retirement/phase.md) | `draft` | TBD |
| 003 | [Compatibility Notes](phase-003-compatibility-notes/phase.md) | `draft` | TBD |

## Entry Criteria

- Stage 002 has a working canonical checkpoint flow.
- No active supported caller depends on legacy direct outline apply behavior.

## Exit Criteria

- `/api/nova/outline/apply` is removed, disabled, or explicitly documented as unsupported.
- Legacy `author-outline` artifacts no longer expose a destructive apply action.
- Tests no longer assert retired behavior as a supported product contract.

## Notes

If persisted legacy artifacts must remain visible, treat them as read-only historical records or provide a migration note.

