---
title: Controller Contracts & State Machine
slug: stage-001-controller-contracts-and-state-machine
stage_number: 1
status: review
owner: Planner Agent
plan: plan-051-governed-ai-controller-runtime
phases:
  - phase-001-define-contracts-and-task-types
  - phase-002-controller-skeleton-and-state-machine
  - phase-003-run-logging-and-entry-points
estimated_duration: 3d
risk_level: medium
---

## Goal

Define request/response and workflow contracts, implement a skeleton controller with a task state machine, and add basic run logging.

## Phases

| #   | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Define Contracts & Task Types](phase-001-define-contracts-and-task-types/phase.md) | `review` | 1d |
| 002 | [Controller Skeleton & State Machine](phase-002-controller-skeleton-and-state-machine/phase.md) | `review` | 1d |
| 003 | [Run Logging & Entry Points](phase-003-run-logging-and-entry-points/phase.md) | `review` | 1d |

## Entry Criteria

- Plan directory and skeleton exist under `dev-docs/plans/plan-051-governed-ai-controller-runtime/`.
- Dependencies listed in the plan frontmatter are marked `complete` or waived.
- Planner has aligned scope with stakeholders; no major unresolved questions remain for this stage.

## Exit Criteria

- All phases in this stage are complete with evidence artifacts.
- Stage-level deliverables are merged into the repository and pass quality gates.
- Stage documentation is finalized and references no unresolved TODOs or placeholders.

## Risks

- Primary risk level: `medium`.
- Escalate any Critical or High defect that could cause silent writes, provider bypass, policy misclassification, or data leaks.

## Notes

This stage is in `review`; keep it out of `complete` until Reviewer Agent sign-off is real.
