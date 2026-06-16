---
title: Worldbuilding Generation Execution State
slug: stage-002-worldbuilding-generation-execution-state
stage_number: 2
status: review
owner: Planner Agent
plan: plan-053-worldbuilding-outline-review-flow-closure
phases:
  - phase-001-generation-action-contract
  - phase-002-route-and-help-integration
estimated_duration: 3d
risk_level: high
---

## Goal

Make worldbuilding Generate controls start real generation work and drive truthful generation states.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Generation Action Contract](phase-001-generation-action-contract/phase.md) | `review` | 1.5d |
| 002 | [Route And Help Integration](phase-002-route-and-help-integration/phase.md) | `review` | 1.5d |

## Entry Criteria

- Proposal review surface can display generated proposals.
- Generation route/provider behavior is inventoried.

## Exit Criteria

- [x] Generate controls no longer only open a seeded Nova prompt while status widgets imply execution.
- [x] Readiness, running, review-ready, and failure states are user-visible and tested.

## Notes

Keep this stage in `draft` until execution starts. Preserve review gates and do not roll status upward until all child phases are ready.
