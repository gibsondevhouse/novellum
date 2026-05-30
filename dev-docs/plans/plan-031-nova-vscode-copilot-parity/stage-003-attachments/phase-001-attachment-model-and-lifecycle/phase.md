---
title: Attachment Model and Lifecycle
slug: phase-001-attachment-model-and-lifecycle
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-003-attachments
parts:
  - part-001-define-nova-attachment-types
  - part-002-store-attachment-lifecycle
estimated_duration: 1d
---

# Phase 001 — Attachment Model and Lifecycle

## Goal

Add attachment data structures and session lifecycle behavior before building UI.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Define Nova Attachment Types](part-001-define-nova-attachment-types/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Store Attachment Lifecycle](part-002-store-attachment-lifecycle/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Attach popover has project and upload tabs with keyboard-accessible navigation.
- [ ] Project entities and `.md/.txt` files ≤100KB attach as chips and clear on new chat.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
