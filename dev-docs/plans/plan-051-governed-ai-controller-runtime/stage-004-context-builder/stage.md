---
title: Context Builder
slug: stage-004-context-builder
stage_number: 4
status: review
owner: Planner Agent
plan: plan-051-governed-ai-controller-runtime
phases:
  - phase-001-context-packet-schema-definition
  - phase-002-context-builder-implementation
  - phase-003-token-budget-and-relevance-rules
estimated_duration: 3d
risk_level: high
---

## Goal

Create a unified context packet interface and build deterministic context assembly functions with token budgets and relevance heuristics.

## Phases

| #   | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Context Packet Schema Definition](phase-001-context-packet-schema-definition/phase.md) | `review` | 0.5d |
| 002 | [Context Builder Implementation](phase-002-context-builder-implementation/phase.md) | `review` | 1.5d |
| 003 | [Token Budget & Relevance Rules](phase-003-token-budget-and-relevance-rules/phase.md) | `review` | 1d |

## Entry Criteria

- Plan directory and skeleton exist under `dev-docs/plans/plan-051-governed-ai-controller-runtime/`.
- Dependencies listed in the plan frontmatter are marked `complete` or waived.
- Planner has aligned scope with stakeholders; no major unresolved questions remain for this stage.

## Exit Criteria

- All phases in this stage are complete with evidence artifacts.
- Stage-level deliverables are merged into the repository and pass quality gates.
- Stage documentation is finalized and references no unresolved TODOs or placeholders.

## Risks

- Primary risk level: `high`.
- Escalate any Critical or High defect that could cause silent writes, provider bypass, policy misclassification, or data leaks.

## Notes

This stage is in `review`; keep it out of `complete` until Reviewer Agent sign-off is real.
