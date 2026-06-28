---
title: Accept Flow & Worldbuild Hookup
slug: stage-003-accept-flow
stage_number: 3
status: review
owner: Planner Agent
plan: plan-043-brainstorm-agent
phases:
  - phase-001-review-accept
  - phase-002-worldbuild-hookup
estimated_duration: 1d
risk_level: medium
---

## Goal

Implement the review-gated accept flow where authors accept individual brainstorm seeds into
a staging area, then hook that staging area into the worldbuilding entity creation forms so
accepted seeds prefill the generation context.

## Phases

| #   | Phase                                                              | Status   | Est. Duration |
| --- | ------------------------------------------------------------------ | -------- | ------------- |
| 001 | [Review & Accept Logic](phase-001-review-accept/phase.md)          | `review` | 0.5d          |
| 002 | [Worldbuild Prefill Context](phase-002-worldbuild-hookup/phase.md) | `review` | 0.5d          |

## Entry Criteria

- Stage-002 (Nova UI) is implementation-complete and in `review`
- Brainstorm proposals are displaying in Nova
- Worldbuilding entity creation forms understood

## Exit Criteria

- All phases complete
- Authors can accept seeds into a staging area
- Accepted seeds appear in worldbuilding generation context controls
- Seeds can be discarded or cleared
- Stage quality gates passed, except full `pnpm test` unrelated outline baseline documented in part evidence

## Notes

This stage is critical for closing the loop: Brainstorm → Worldbuild. Ensure the accepted
seeds flow smoothly into the entity generation context.
