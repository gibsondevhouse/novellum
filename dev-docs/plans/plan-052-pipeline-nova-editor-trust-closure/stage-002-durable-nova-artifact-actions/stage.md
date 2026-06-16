---
title: Durable Nova Artifact Actions
slug: stage-002-durable-nova-artifact-actions
stage_number: 2
status: review
owner: Planner Agent
plan: plan-052-pipeline-nova-editor-trust-closure
phases:
  - phase-001-scene-draft-action-bridge
  - phase-002-revision-pack-acknowledgement
estimated_duration: 3d
risk_level: high
---

## Goal

Make the two functional blockers durable and review-gated: scene draft Accept/Reject and revision pack Acknowledge.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Scene Draft Action Bridge](phase-001-scene-draft-action-bridge/phase.md) | `review` | 1.5d |
| 002 | [Revision Pack Acknowledgement](phase-002-revision-pack-acknowledgement/phase.md) | `review` | 1.5d |

## Entry Criteria

- Artifact action contract is accepted.
- Existing author draft accept/reject behavior is understood and preserved.

## Exit Criteria

- [x] Scene draft actions no longer look successful without a durable effect.
- [x] Revision acknowledgements persist across route changes and reloads.

## Notes

Stage implementation is in `review` pending real Reviewer Agent sign-off. Preserve review gates and do not mark complete until sign-off is real.
