---
title: Composer Auto-Grow and Action Row
slug: phase-003-composer-action-row
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-001-compact-sidepanel-shell
parts:
  - part-001-implement-autogrow-composer-input
  - part-002-build-single-action-row-controls
estimated_duration: 1d
---

# Phase 003 — Composer Auto-Grow and Action Row

## Goal

Replace the prototype composer with a compact, single-line auto-grow input and a single action row.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Implement Auto-Grow Composer Input](part-001-implement-autogrow-composer-input/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Build Single Action Row Controls](part-002-build-single-action-row-controls/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Header, body, composer, message log, and footer use compact spacing tokens and remain keyboard accessible.
- [ ] Composer presents one action row: attach, slash/tools slot, mode slot placeholder, model picker, send.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
