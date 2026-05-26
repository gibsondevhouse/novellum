---
title: Act Chapter Scene Navigator Refactor
slug: phase-001-act-chapter-scene-navigator-refactor
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-003-navigator-hierarchy-and-selection-ux
parts:
  - part-001-selector-first-navigator-implementation
estimated_duration: 4d
---

## Goal

Deliver a hierarchical navigator surface that keeps selection state obvious while preserving fast structure editing.

## Parts

- 001: [Selector First Navigator Implementation](part-001-selector-first-navigator-implementation/part.md) (`draft`, Frontend Agent, 4d)

## Acceptance Criteria

- [ ] Navigator tree renders act -> chapter -> scene reliably
- [ ] Selected node and context are visually unambiguous
- [ ] Keyboard users can traverse and select without pointer dependence

## Notes

Keep interactions predictable; no hidden selection side effects.
