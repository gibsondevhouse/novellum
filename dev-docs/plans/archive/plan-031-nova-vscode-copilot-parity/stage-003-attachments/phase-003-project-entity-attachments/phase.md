---
title: Project Entity Attachments
slug: phase-003-project-entity-attachments
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-003-attachments
parts:
  - part-001-wire-project-entity-querying
  - part-002-handle-entity-loading-and-empty-states
estimated_duration: 1d
---

# Phase 003 — Project Entity Attachments

## Goal

Wire project entity selection to existing repositories without inventing new persistence paths.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Wire Project Entity Querying](part-001-wire-project-entity-querying/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Handle Entity Loading and Empty States](part-002-handle-entity-loading-and-empty-states/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Attach popover has project and upload tabs with keyboard-accessible navigation.
- [ ] Project entities and `.md/.txt` files ≤100KB attach as chips and clear on new chat.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
