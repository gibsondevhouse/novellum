---
title: Define Contracts & Task Types
slug: phase-001-define-contracts-and-task-types
phase_number: 1
status: review
owner: Planner Agent
stage: stage-001-controller-contracts-and-state-machine
parts:
  - part-001-define-ai-contract-types
  - part-002-define-workflow-contract
estimated_duration: 1d
---

## Goal

Define the core TypeScript interfaces for AI requests and responses, the task status enumeration, and the workflow definition schema.

## Parts

| #   | Part | Status | Assigned To | Est. Duration |
| --- | ---- | ------ | ----------- | ------------- |
| 001 | [Define AI Request & Response Types](part-001-define-ai-contract-types/part.md) | `review` | Planner Agent | 0.5d |
| 002 | [Define Workflow Contract](part-002-define-workflow-contract/part.md) | `review` | Planner Agent | 0.5d |

## Acceptance Criteria

- [x] All parts reach `review` with evidence artifacts; completion awaits Reviewer Agent sign-off.
- [x] Phase implementation remains inside declared repo/module boundaries.
- [x] Any deviation from planned files is documented in the relevant `impl.log.md`.
- [x] Required tests for the phase pass or have a documented waiver.

## Notes

This phase is in `review`; keep it out of `complete` until Reviewer Agent sign-off is real.
