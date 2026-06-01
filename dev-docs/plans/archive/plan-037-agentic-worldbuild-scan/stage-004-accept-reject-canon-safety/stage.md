---
title: Accept/Reject Integration & Canon Projection Safety
slug: stage-004-accept-reject-canon-safety
stage_number: 4
status: complete
owner: Planner Agent
plan: plan-037-agentic-worldbuild-scan
phases:
  - phase-001-wire-accept-reject-mutations
  - phase-002-enforce-atomic-projection-safety
  - phase-003-verify-no-preaccept-canon-writes
estimated_duration: 2d
risk_level: high
---

## Goal

Integrate accept/reject flows with auditable persistence and safe canon projection guarantees so proposals never bypass review gates.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Wire Accept/Reject Mutations](phase-001-wire-accept-reject-mutations/phase.md) | `complete` | 0.75d |
| 002 | [Enforce Atomic Projection Safety](phase-002-enforce-atomic-projection-safety/phase.md) | `complete` | 0.75d |
| 003 | [Verify No Pre-Accept Canon Writes](phase-003-verify-no-preaccept-canon-writes/phase.md) | `complete` | 0.5d |

## Entry Criteria

- Stage 003 review surfaces are functional against staged proposals.
- Existing checkpoint/projection boundaries are validated.

## Exit Criteria

- Accept/reject actions are auditable and lifecycle transitions are safe.
- Partial projection is prevented or explicitly rolled back.
- Regression proof exists that pre-accept suggestions are non-canonical only.

## Notes

This stage is the primary safety gate for canon integrity and must block merge on unresolved projection risk.
