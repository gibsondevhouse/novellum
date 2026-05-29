---
title: Attachment Context and Disclosure
slug: phase-005-attachment-context-disclosure
phase_number: 5
status: complete
owner: Planner Agent
stage: stage-003-attachments
parts:
  - part-001-add-user-attached-context-scope
  - part-002-update-context-disclosure-counts
estimated_duration: 1d
---

# Phase 005 — Attachment Context and Disclosure

## Goal

Make attachments actually affect Nova context and disclose them separately from RAG or project baseline scopes.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add User-Attached Context Scope](part-001-add-user-attached-context-scope/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Update Context Disclosure Counts](part-002-update-context-disclosure-counts/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Attach popover has project and upload tabs with keyboard-accessible navigation.
- [ ] Project entities and `.md/.txt` files ≤100KB attach as chips and clear on new chat.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
