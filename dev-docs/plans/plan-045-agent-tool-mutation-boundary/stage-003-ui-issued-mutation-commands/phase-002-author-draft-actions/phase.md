---
title: Author Draft Actions
slug: phase-002-author-draft-actions
phase_number: 2
status: review
owner: Planner Agent
stage: stage-003-ui-issued-mutation-commands
parts:
  - part-001-author-draft-actions
estimated_duration: TBD
---

## Goal

Keep author draft accept/reject behind visible review card actions.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Author Draft Actions](part-001-author-draft-actions/part.md) | `review` | — | TBD |

## Acceptance Criteria

- [x] Model-callable tool list cannot apply scene prose.
- [x] UI accept still updates scene content after confirmation/stale guards.
- [x] Reject/regenerate behavior remains intact.

## Notes

Ensure scene prose can only be applied by explicit author action through `NovaAuthorDraftCheckpointCard` or equivalent UI.
