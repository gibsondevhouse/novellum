---
title: Surface Primitives — Cards & Panels
slug: phase-001-surface-primitives
phase_number: 1
status: complete
owner: Stylist Agent
stage: stage-003-primitive-pattern-convergence
parts:
  - part-001-cards-and-panels-sweep
estimated_duration: 2d
---

## Goal

Retire local re-implementations of `SurfaceCard` and `SurfacePanel` throughout module code.

## Parts

- 001 [Cards & Panels Sweep](part-001-cards-and-panels-sweep/part.md) — status: `complete`; assigned: Stylist; est: 2d

## Acceptance Criteria

- [x] All parts reach `complete` status
- [x] Zero local card/panel variants remain in `src/modules/**`.
- [x] Converted surfaces preserve their archetype.

## Notes

- Every file touched must be listed explicitly in the part.
