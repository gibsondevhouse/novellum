---
title: Canon Projection Audit
slug: stage-001-canon-projection-audit
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-047-worldbuilding-canon-merge-diff
phases:
  - phase-001-current-write-map
  - phase-002-entity-field-coverage
  - phase-003-duplicate-and-relationship-gap-map
estimated_duration: TBD
risk_level: medium
---

## Goal

Map how worldbuilding proposals and checkpoints currently project into canon tables, including insert-only behavior, missing fields, duplicate handling, and relationship gaps.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Current Write Map](phase-001-current-write-map/phase.md) | `complete` | TBD |
| 002 | [Entity Field Coverage](phase-002-entity-field-coverage/phase.md) | `complete` | TBD |
| 003 | [Duplicate & Relationship Gap Map](phase-003-duplicate-and-relationship-gap-map/phase.md) | `complete` | TBD |

## Entry Criteria

- Current worldbuilding scan, generation, proposal, and checkpoint projection services are available for inspection.

## Exit Criteria

- Canon write paths are documented by entity family.
- Missing field and relationship projections are identified.
- Duplicate detection limits are clear enough to design merge behavior.

## Notes

Start with `applyProposalProjection`, `applyPopulatedBibleProjection`, worldbuilding scan dedupe, and proposal review UI.
