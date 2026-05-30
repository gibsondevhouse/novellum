---
title: Attachments
slug: stage-003-attachments
stage_number: 3
status: complete
owner: Planner Agent
plan: plan-031-nova-vscode-copilot-parity
phases:
  - phase-001-attachment-model-and-lifecycle
  - phase-002-attach-popover-ui
  - phase-003-project-entity-attachments
  - phase-004-file-upload-validation
  - phase-005-attachment-context-disclosure
  - phase-006-attachment-tests-and-evidence
estimated_duration: 5d
risk_level: high
---

# Stage 003 — Attachments

## Goal

Make the `+` affordance real: users can attach project entities and plain-text files to a Nova conversation, and those attachments become a disclosed additive context scope.

## Phases

| # | Phase | Status | Est. Duration | Goal |
| --- | --- | --- | --- | --- |
| 001 | [Attachment Model and Lifecycle](phase-001-attachment-model-and-lifecycle/phase.md) | `draft` | 1d | Add attachment data structures and session lifecycle behavior before building UI. |
| 002 | [Attach Popover UI](phase-002-attach-popover-ui/phase.md) | `draft` | 1d | Build the two-tab popover without wiring unsafe file or repository behavior prematurely. |
| 003 | [Project Entity Attachments](phase-003-project-entity-attachments/phase.md) | `draft` | 1d | Wire project entity selection to existing repositories without inventing new persistence paths. |
| 004 | [File Upload Validation](phase-004-file-upload-validation/phase.md) | `draft` | 1d | Support `.md` and `.txt` upload only, with OWASP-style boundary rejection and plain-text parsing. |
| 005 | [Attachment Context and Disclosure](phase-005-attachment-context-disclosure/phase.md) | `draft` | 1d | Make attachments actually affect Nova context and disclose them separately from RAG or project baseline scopes. |
| 006 | [Attachment Tests and Evidence](phase-006-attachment-tests-and-evidence/phase.md) | `draft` | 0.5d | Prove attachment behavior is real, safe, disclosed, and cleared at the right lifecycle boundary. |

## Entry Criteria

- Stage 001 compact composer includes the attach affordance.
- Stage 002 mode routing is in place so attachment behavior can be verified per mode.
- Project repository access patterns for scenes, characters, locations, and outline nodes are identified before UI wiring.

## Exit Criteria

- [ ] Attach popover has project and upload tabs with keyboard-accessible navigation.
- [ ] Project entities and `.md/.txt` files ≤100KB attach as chips and clear on new chat.
- [ ] Attachments are validated client-side and server-side and counted as `'user-attached'` context.
- [ ] Invalid files are rejected at the boundary with actionable UI copy and tests.

## Notes

- Status remains `draft` until implementation begins.
- Stage status derives from child phase statuses.
- Evidence must be stored under the relevant part `evidence/` directory.
