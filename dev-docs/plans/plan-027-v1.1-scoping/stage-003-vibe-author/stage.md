---
title: Stage 003 - Vibe-Author
slug: stage-003-vibe-author
stage_number: 3
status: draft
owner: Planner Agent
plan: plan-027-v1.1-scoping
phases:
  - phase-001-author-task-surface
  - phase-002-author-hierarchy-integration
  - phase-003-author-drafting-revision-qa
estimated_duration: 10d
risk_level: high
---

## Goal

Ship authoring-stage generation from premise through revision pack with strict hierarchy alignment and explicit accept gates.

## Phases

| #   | Phase                                                                             | Status  | Est. Duration |
| --- | --------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Author Task Surface](phase-001-author-task-surface/phase.md)                    | `draft` | 3d            |
| 002 | [Author Hierarchy Integration](phase-002-author-hierarchy-integration/phase.md)  | `draft` | 3d            |
| 003 | [Author Drafting Revision QA](phase-003-author-drafting-revision-qa/phase.md)    | `draft` | 4d            |

## Entry Criteria

- Stage 002 worldbuild flow is complete and test-backed.
- Canonical hierarchy mapping is stable in contracts/context services.

## Exit Criteria

- All phases complete
- Author pipeline stages support draft/review/accept without silent manuscript edits
- Cross-layer context retrieval includes milestones and stages

## Notes

This stage must preserve human authorship ownership: suggestions and drafts only, never automatic manuscript mutation.
