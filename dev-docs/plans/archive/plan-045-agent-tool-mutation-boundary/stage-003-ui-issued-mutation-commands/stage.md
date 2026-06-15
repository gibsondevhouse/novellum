---
title: UI-Issued Mutation Commands
slug: stage-003-ui-issued-mutation-commands
stage_number: 3
status: complete
owner: Planner Agent
plan: plan-045-agent-tool-mutation-boundary
phases:
  - phase-001-command-boundary-design
  - phase-002-author-draft-actions
  - phase-003-worldbuild-and-outline-actions
estimated_duration: TBD
risk_level: high
---

## Goal

Keep accept/reject/apply functionality available to authors through explicit UI actions while preventing the model loop from issuing those mutations.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Command Boundary Design](phase-001-command-boundary-design/phase.md) | `complete` | TBD |
| 002 | [Author Draft Actions](phase-002-author-draft-actions/phase.md) | `complete` | TBD |
| 003 | [Worldbuild & Outline Actions](phase-003-worldbuild-and-outline-actions/phase.md) | `complete` | TBD |

## Entry Criteria

- Stage 002 policy enforcement exists or is fully designed.
- Existing review cards and mutation API routes are inventoried.

## Exit Criteria

- [x] UI review cards can still accept and reject checkpoints/proposals.
- [x] Model-callable Agent mode can surface review artifacts without applying them.
- [x] Author intent is explicit at every manuscript or canon mutation boundary.

## Notes

Do not remove server-side stale guards or atomic transactions. This stage changes who can invoke mutation actions, not the safety checks themselves.
