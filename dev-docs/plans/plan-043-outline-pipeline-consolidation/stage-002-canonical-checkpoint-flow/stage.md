---
title: Canonical Checkpoint Flow
slug: stage-002-canonical-checkpoint-flow
stage_number: 2
status: draft
owner: Planner Agent
plan: plan-043-outline-pipeline-consolidation
phases:
  - phase-001-generation-entrypoint
  - phase-002-review-card-wiring
  - phase-003-materialization-contract
estimated_duration: TBD
risk_level: high
---

## Goal

Make the outline checkpoint pipeline the canonical user-facing path for generating, reviewing, rejecting, and accepting outlines.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Generation Entrypoint](phase-001-generation-entrypoint/phase.md) | `draft` | TBD |
| 002 | [Review Card Wiring](phase-002-review-card-wiring/phase.md) | `draft` | TBD |
| 003 | [Materialization Contract](phase-003-materialization-contract/phase.md) | `draft` | TBD |

## Entry Criteria

- Stage 001 inventory identifies every outline generation and apply surface.
- The current checkpoint acceptance route and materialization service are verified.

## Exit Criteria

- All supported outline generation UX reaches the checkpoint generation route.
- Review UI uses the checkpoint card and dedicated accept/reject actions.
- Conflict, stale-check, and rollback behavior remain covered by tests.

## Notes

This stage should preserve the plan-040 safety guarantees and avoid adding any new direct hierarchy mutation path.

