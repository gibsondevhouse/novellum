---
title: File Upload Validation
slug: phase-004-file-upload-validation
phase_number: 4
status: complete
owner: Planner Agent
stage: stage-003-attachments
parts:
  - part-001-implement-client-file-validation
  - part-002-implement-server-attachment-validation
estimated_duration: 1d
---

# Phase 004 — File Upload Validation

## Goal

Support `.md` and `.txt` upload only, with OWASP-style boundary rejection and plain-text parsing.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Implement Client File Validation](part-001-implement-client-file-validation/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Implement Server Attachment Validation](part-002-implement-server-attachment-validation/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Attach popover has project and upload tabs with keyboard-accessible navigation.
- [ ] Project entities and `.md/.txt` files ≤100KB attach as chips and clear on new chat.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
