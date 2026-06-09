---
title: Review Card Wiring
slug: phase-002-review-card-wiring
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-002-canonical-checkpoint-flow
parts:
  - part-001-review-card-wiring
estimated_duration: TBD
---

## Goal

Make the checkpoint review card the only supported outline accept/reject UI.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Review Card Wiring](part-001-review-card-wiring/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] The only outline UI that can apply hierarchy changes is the checkpoint card.
- [ ] Reject and accept actions remain explicit and visible.
- [ ] Legacy cards cannot trigger hierarchy replacement.

## Notes

Ensure generated outline proposals render through `NovaOutlineDraftCheckpointCard` with explicit reject and accept actions.
