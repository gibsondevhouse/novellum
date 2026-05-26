---
title: Interactive Primitives
slug: phase-002-interactive-primitives
phase_number: 2
status: complete
owner: Stylist Agent
stage: stage-003-primitive-pattern-convergence
parts:
  - part-001-interactive-primitives-sweep
estimated_duration: 1.5d
---

## Goal

Retire local re-implementations of buttons, inputs, textareas, pills, and tabs.

## Parts

- 001 [Interactive Primitives Sweep](part-001-interactive-primitives-sweep/part.md) — status: `complete`; assigned: Stylist; est: 1.5d

## Acceptance Criteria

- [x] All parts reach `complete` status
- [x] `PrimaryButton` / `SecondaryButton` / `GhostButton` / `DestructiveButton` / `Input` / `PillNav` are used in place of every local variant.
- [x] Focus and hover states behave identically.

## Notes

- Accessibility focus rules must be preserved; verify with the `accessibility-a11y` skill.
