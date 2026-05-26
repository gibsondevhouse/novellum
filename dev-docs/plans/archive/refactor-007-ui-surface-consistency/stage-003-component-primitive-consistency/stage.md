---
title: Component Primitive Consistency
slug: stage-003-component-primitive-consistency
stage_number: 3
status: complete
owner: Planner Agent
plan: refactor-007-ui-surface-consistency
phases:
  - phase-001-module-primitive-migration
estimated_duration: 3d
risk_level: medium
---

## Goal

Standardize interactive and surface primitives across all targeted modules by replacing raw element styling with approved Novellum UI primitives.

## Phases

| #   | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Module Primitive Migration](phase-001-module-primitive-migration/phase.md) | `draft` | 3d |

## Entry Criteria

- Stage 002 token enforcement is complete in scoped modules.
- Primitive components are available and stable.

## Exit Criteria

- Raw styled button and ad-hoc styled surface patterns are removed from scoped modules.
- Component inventory diffs are captured per module.
- UI behavior remains functionally equivalent.

## Notes

This stage enforces PrimaryButton, GhostButton, SurfaceCard, SurfacePanel, and SectionHeader usage for consistency.
