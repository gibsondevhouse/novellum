---
title: Hub, Library & Module Restyle
slug: stage-005-hub-library-modules
stage_number: 5
status: complete
owner: Stylist Agent
plan: plan-026-ui-v2-design-system
phases:
  - phase-001-hub
  - phase-002-library-cards
  - phase-003-settings-onboarding
  - phase-004-outline-continuity-world
  - phase-005-overlays-and-planning
estimated_duration: 2d
risk_level: low
---

## Goal

Restyle every remaining surface with v2 primitives and visual language. No
screen still references v1 surfaces (cool `#191917`) or hardcoded colors.

## Phases

| #   | Phase                                                                                              | Status        | Est. Duration |
| --- | -------------------------------------------------------------------------------------------------- | ------------- | ------------- |
| 001 | [Hub (hero spotlight)](phase-001-hub/phase.md)                                                     | `in-progress` | 0.25d         |
| 002 | [Library Cards](phase-002-library-cards/phase.md)                                                  | `complete`    | 0.5d          |
| 003 | [Settings & Onboarding](phase-003-settings-onboarding/phase.md)                                    | `in-progress` | 0.5d          |
| 004 | [Outline / Continuity / World-Building / Story-Bible](phase-004-outline-continuity-world/phase.md) | `review`      | 0.75d         |
| 005 | [Overlays & Planning](phase-005-overlays-and-planning/phase.md)                                    | `complete`    | 0.25d         |

## Entry Criteria

- Stage 002 complete (primitives stable).
- Can run in parallel with Stage 004.

## Exit Criteria

- Project Hub: six narrative tiles (Manuscript / Outline / World / Reader /
  Continuity / Export) with body copy in narrative voice; shared spotlight
  gradient (no per-project mood engine).
- Library: gradient cover grid restyled to v2 cover anatomy; `LibraryHeroCard`
  uses parchment excerpt patch; `ProjectCreateCard` dashed-border ghost.
- Settings tabs render new `PageHeader` + `SurfacePanel` cards.
- Outline / Continuity / World-Building / Story-Bible entity cards and forms
  consume new tokens; `EditorialEyebrow` used for column headers.
- Onboarding uses new `Stepper`, `PageHeader`, `SurfacePanel`.
- Planning surfaces and AI suggestion / Rewrite overlays adopt v2 overlay
  anatomy with candle-warm highlights.

## Notes

- Phases 001–004 are parallel-safe; assign to separate workers if available.
- `world-building.css` and `world-building-entities.css` need a token sweep —
  no hex literals.
