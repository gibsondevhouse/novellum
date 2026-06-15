---
title: Intent Resolver
slug: stage-002-intent-resolver
stage_number: 2
status: review
owner: Planner Agent
plan: plan-051-governed-ai-controller-runtime
phases:
  - phase-001-intent-taxonomy
  - phase-002-intent-resolver-implementation
estimated_duration: 2d
risk_level: low
---

## Goal

Establish a canonical set of AI intents and implement a resolver that maps user actions to these intents.

## Phases

| #   | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Intent Taxonomy](phase-001-intent-taxonomy/phase.md) | `review` | 0.5d |
| 002 | [Intent Resolver Implementation](phase-002-intent-resolver-implementation/phase.md) | `review` | 1.5d |

## Entry Criteria

- Plan directory and skeleton exist under `dev-docs/plans/plan-051-governed-ai-controller-runtime/`.
- Dependencies listed in the plan frontmatter are marked `complete` or waived.
- Planner has aligned scope with stakeholders; no major unresolved questions remain for this stage.

## Exit Criteria

- All phases in this stage are complete with evidence artifacts.
- Stage-level deliverables are merged into the repository and pass quality gates.
- Stage documentation is finalized and references no unresolved TODOs or placeholders.

## Risks

- Primary risk level: `low`.
- Escalate any Critical or High defect that could cause silent writes, provider bypass, policy misclassification, or data leaks.

## Notes

This stage is in `review`; keep it out of `complete` until Reviewer Agent sign-off is real.
