---
title: Attach Popover UI
slug: phase-002-attach-popover-ui
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-003-attachments
parts:
  - part-001-build-accessible-attach-popover
  - part-002-render-attachment-chips
estimated_duration: 1d
---

# Phase 002 — Attach Popover UI

## Goal

Build the two-tab popover without wiring unsafe file or repository behavior prematurely.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Build Accessible Attach Popover](part-001-build-accessible-attach-popover/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Render Attachment Chips](part-002-render-attachment-chips/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Attach popover has project and upload tabs with keyboard-accessible navigation.
- [ ] Project entities and `.md/.txt` files ≤100KB attach as chips and clear on new chat.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
