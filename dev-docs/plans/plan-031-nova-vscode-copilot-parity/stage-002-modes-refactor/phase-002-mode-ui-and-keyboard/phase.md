---
title: Mode UI and Keyboard Contract
slug: phase-002-mode-ui-and-keyboard
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-002-modes-refactor
parts:
  - part-001-add-mode-pill-control
  - part-002-implement-mode-keyboard-cycle
estimated_duration: 0.75d
---

# Phase 002 — Mode UI and Keyboard Contract

## Goal

Expose the mode model through the compact composer without turning the sidepanel back into a bulky control surface.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add Mode Pill Control](part-001-add-mode-pill-control/part.md) | `draft` | Implementation Agent | 0.25d |
| 002 | [Implement Mode Keyboard Cycle](part-002-implement-mode-keyboard-cycle/part.md) | `draft` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [x] All parts reach `complete` after reviewer signoff.
- [x] `NovaMode = 'ask' | 'write' | 'agent'` replaces `chat | scribe` across Nova types, store, UI, and resolver routing.
- [x] Each mode has distinct placeholder copy, system prompt behavior, and acceptance-tested route behavior.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
