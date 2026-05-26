---
title: Primitive Standardization
slug: phase-002-primitive-standardization
phase_number: 2
status: draft
owner: Architect / Stylist
stage: stage-002-tokens-primitives
parts:
  - part-001-implement-high-level-primitives
  - part-002-implement-feedback-primitives
estimated_duration: 3d
---

# Phase-002: Primitive Standardization

## Goal

Create the shared cinematic UI primitives that route families will consume in Stages 003 through 007.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Implement High-Level Primitives](part-001-implement-high-level-primitives.md) | `draft` | Architect / Stylist | 2d |
| 002 | [Implement Feedback and Overlay Primitives](part-002-implement-feedback-primitives.md) | `draft` | Architect / Stylist | 1d |

## Implementation Strategy

Build primitives in `src/lib/components/ui/`, export them from `src/lib/components/ui/index.ts`, and keep them visual/interaction focused. Domain-specific behavior belongs in module wrappers, not in shared primitives.

## Acceptance Criteria

- [ ] Primitive contracts from the top-level plan are implemented or explicitly deferred with reason.
- [ ] New primitives are token-only and pass `check:tokens`.
- [ ] New primitives include accessible labels, focus states, reduced-motion behavior, and stable responsive dimensions.
- [ ] Visual examples or documentation demonstrate each primitive.
- [ ] Existing duplicate patterns have a documented migration target.

## Edge Cases

- Posters need configurable aspect ratios for books, characters, scenes, images, locations, and lore.
- Floating bars/docks must collapse or become sticky inline controls on narrow screens.
