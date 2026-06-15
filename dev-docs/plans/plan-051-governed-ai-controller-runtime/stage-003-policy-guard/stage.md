---
title: Policy Guard
slug: stage-003-policy-guard
stage_number: 3
status: review
owner: Planner Agent
plan: plan-051-governed-ai-controller-runtime
phases:
  - phase-001-permission-model-and-metadata
  - phase-002-policy-evaluator-implementation
estimated_duration: 2d
risk_level: medium
---

## Goal

Define permissions and allowed operations for AI workflows and implement a guard that enforces these boundaries before model execution.

## Phases

| #   | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Permission Model & Metadata](phase-001-permission-model-and-metadata/phase.md) | `review` | 0.5d |
| 002 | [Policy Evaluator Implementation](phase-002-policy-evaluator-implementation/phase.md) | `review` | 1.5d |

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
