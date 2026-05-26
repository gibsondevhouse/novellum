---
title: Primitive Refresh
slug: stage-002-primitives
stage_number: 2
status: complete
owner: Stylist Agent
plan: plan-026-ui-v2-design-system
phases:
  - phase-001-editorial-primitives
  - phase-002-existing-primitive-tune
estimated_duration: 1d
risk_level: low
---

## Goal

Refresh shared primitives under `src/lib/components/ui/` so every consumer
automatically inherits v2 anatomy. Add four new editorial primitives required by
Stages 004–005.

## Phases

| #   | Phase                                                                          | Status        | Est. Duration |
| --- | ------------------------------------------------------------------------------ | ------------- | ------------- |
| 001 | [Editorial Primitives](phase-001-editorial-primitives/phase.md)                | `complete`    | 0.5d          |
| 002 | [Existing Primitive Tune](phase-002-existing-primitive-tune/phase.md)          | `in-progress` | 0.5d          |

## Entry Criteria

- Stage 001 complete (tokens land).

## Exit Criteria

- New primitives `EditorialEyebrow`, `Logline`, `Ornament`, `DropCap` exist and
  are barrel-exported.
- `PageHeader`, `SectionHeader`, `EntityDetailHeader`, `Input`, `SurfaceCard`,
  `SurfacePanel`, `EmptyStatePanel`, `StatusBadge`, `PillNav`, `PillToolbar`,
  `Stepper`, `Breadcrumb`, Button family all reviewed against `preview/*.html`
  reference cards — no hardcoded values, focus rings consistent.
- `/styles` showcase route visually matches the v2 preview cards.
- Quality gates green.

## Notes

- Most primitives already token-driven and inherit warm umber automatically from
  Stage 001. Stage 002 is mostly micro-anatomy tweaks (eyebrow letter-spacing,
  focus-ring offsets) and net-new editorial primitives.
- Visual regression baselines NOT regenerated in this stage — deferred to
  Stage 006.
