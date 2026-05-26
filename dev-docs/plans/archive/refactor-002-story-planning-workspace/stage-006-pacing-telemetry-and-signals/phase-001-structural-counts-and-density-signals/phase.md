---
title: Structural Counts and Density Signals
slug: phase-001-structural-counts-and-density-signals
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-006-pacing-telemetry-and-signals
parts:
  - part-001-pacing-telemetry-implementation
estimated_duration: 3d
---

## Goal

Compute and display practical pacing signals directly in structure and detail surfaces.

## Parts

- 001: [Pacing Telemetry Implementation](part-001-pacing-telemetry-implementation/part.md) (`draft`, Frontend Agent, 3d)

## Acceptance Criteria

- [ ] Structural counts update with create, delete, and reorder actions
- [ ] Density states are surfaced with clear semantics
- [ ] Missing planning sections are highlighted without blocking edits

## Notes

Use lightweight computed metrics; avoid expensive recompute loops.
