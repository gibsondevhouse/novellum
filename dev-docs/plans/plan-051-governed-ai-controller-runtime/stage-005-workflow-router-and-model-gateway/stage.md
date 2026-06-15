---
title: Workflow Router & Model Gateway
slug: stage-005-workflow-router-and-model-gateway
stage_number: 5
status: review
owner: Planner Agent
plan: plan-051-governed-ai-controller-runtime
phases:
  - phase-001-workflow-registry-definition
  - phase-002-model-gateway-implementation
  - phase-003-router-integration
estimated_duration: 3d
risk_level: medium
---

## Goal

Register supported workflows with their schemas and allowed tools, add a provider-agnostic model gateway, and wire the router into the controller.

## Phases

| #   | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Workflow Registry Definition](phase-001-workflow-registry-definition/phase.md) | `review` | 1d |
| 002 | [Model Gateway Implementation](phase-002-model-gateway-implementation/phase.md) | `review` | 1d |
| 003 | [Router Integration](phase-003-router-integration/phase.md) | `review` | 1d |

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
