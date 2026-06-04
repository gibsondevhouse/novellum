---
title: Worldbuild Prefill Context
slug: phase-002-worldbuild-hookup
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-003-accept-flow
parts:
  - part-001-prefill-context
estimated_duration: 0.5d
---

## Goal

Hook the brainstorm staging store into worldbuilding entity creation forms so that accepted
seeds prefill the generation context and initial draft fields.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Prefill Context](part-001-prefill-context/part.md) | `draft` | — | 0.5d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Accepted seeds from brainstorm populate worldbuild context
- [ ] Entity creation forms prefill with seed data
- [ ] Prefill data can be edited or cleared
- [ ] E2E flow tested: brainstorm → accept → worldbuild generation

## Notes

This closes the Brainstorm → Worldbuild loop. The accepted seeds become context for the
worldbuilding generation engine.
