---
title: Workspace Family Convergence
slug: stage-004-workspace-family-convergence
stage_number: 4
status: complete
owner: Stylist Agent
plan: plan-016-visual-consistency
phases:
  - phase-001-workspace-shell-parity
  - phase-002-inspector-parity
  - phase-003-interaction-parity
estimated_duration: 4d
risk_level: medium
started_at: 2026-04-25 00:15 EDT
completed_at: 2026-04-25 19:15 EDT
---

## Goal

Make Arc, Act, Chapter, and Scene workspaces feel like one planning family — shared shell rhythm, shared hero card, shared inspector, and shared interaction model for selection, create, and edit flows.

## Phases

| #   | Phase                                                                     | Status        | Est. Duration |
| --- | ------------------------------------------------------------------------- | ------------- | ------------- |
| 001 | [Workspace Shell Parity](phase-001-workspace-shell-parity/phase.md)       | `complete`    | 1.5d          |
| 002 | [Inspector Parity](phase-002-inspector-parity/phase.md)                   | `complete`    | 1.5d          |
| 003 | [Interaction Parity](phase-003-interaction-parity/phase.md)               | `complete`    | 1d            |

## Entry Criteria

- Stages 002 and 003 complete.
- Canonical rules for planning workspaces are accepted (hierarchy↔detail rhythm, workspace hero card, inspector panel contract).

## Exit Criteria

- Arc, Act, Chapter, and Scene workspace routes share one `WorkspaceShell`, one hero card, and one inspector panel contract.
- Selection, create, and edit interactions behave identically across the four workspaces (inline vs modal vs drawer decisions are explicit and uniform).
- Empty states across the workspace family use the same primitive and tone.
- All visual QA screenshots across the family look like siblings, not cousins.

## Notes

- Do not solve consistency by flattening intentional differences between Arc and Scene scopes — scope context still matters, but its _presentation_ is unified.
- Part changes must be file-specific. Parts referencing `workspace-mode.svelte.ts` or related state must coordinate with plan-013's hierarchy work if it lands first.
