---
title: Generation Action Contract
slug: phase-001-generation-action-contract
phase_number: 1
status: review
owner: Planner Agent
stage: stage-002-worldbuilding-generation-execution-state
parts:
  - part-001-replace-nova-prompt-seeding-with-generation-action-service
  - part-002-add-generation-failure-retry-semantics
estimated_duration: 1.5d
---

## Goal

Define and implement the worldbuilding generation action service that owns readiness checks, route calls, and state transitions.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Replace Nova Prompt Seeding With Generation Action Service](part-001-replace-nova-prompt-seeding-with-generation-action-service/part.md) | `review` | Codex | 1d |
| 002 | [Add Generation Failure Retry Semantics](part-002-add-generation-failure-retry-semantics/part.md) | `review` | Codex | 0.5d |

## Acceptance Criteria

- [x] Actions call real generation endpoints or explicitly block with missing-context copy.
- [x] The generation state machine is invoked from route actions.
- [ ] All parts reach `complete` after real Reviewer Agent sign-off.

## Notes

Phase remains draft until execution begins. Add implementation evidence under each part before moving to review.
