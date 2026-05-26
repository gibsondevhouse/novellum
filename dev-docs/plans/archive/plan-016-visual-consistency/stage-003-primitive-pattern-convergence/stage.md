---
title: Primitive and Pattern Convergence
slug: stage-003-primitive-pattern-convergence
stage_number: 3
status: complete
owner: Stylist Agent
plan: plan-016-visual-consistency
phases:
  - phase-001-surface-primitives
  - phase-002-interactive-primitives
  - phase-003-composite-patterns
estimated_duration: 5d
risk_level: medium
---

## Goal

Replace every local duplicate of a card, panel, button, input, pill, tab, section header, metadata row, entity card, stat card, or empty state with the canonical primitive from `src/lib/components/ui`. Retire duplicated visual structures even when their CSS already uses tokens.

## Phases

- 001 [Surface Primitives: Cards & Panels](phase-001-surface-primitives/phase.md) — status: `complete`; est: 2d
- 002 [Interactive Primitives](phase-002-interactive-primitives/phase.md) — status: `complete`; est: 1.5d
- 003 [Composite Patterns](phase-003-composite-patterns/phase.md) — status: `complete`; est: 1.5d

## Entry Criteria

- Stage 002 complete; canonical shell is in place so primitive sweeps do not fight layout-local CSS.
- Component Primitive Audit from Stage 001 lists every duplicate with file attribution.

## Exit Criteria

- Zero local re-implementations of `SurfaceCard`, `SurfacePanel`, `SectionHeader`, `EmptyStatePanel`, `PrimaryButton`, `SecondaryButton`, `GhostButton`, `DestructiveButton`, `Input`, or `PillNav` remain in module code.
- Composite patterns (metadata row, entity card, stat card, list row, inspector panel, workspace hero card) are promoted to shared primitives or documented as intentional module-local components.
- All converted surfaces preserve their intended archetype — writing surfaces stay calm, planning surfaces stay structured, entity surfaces stay cinematic.
- Lint, typecheck, tokens, boundaries, and tests gates pass.

## Notes

- Stylist-led; Architect consults on layout primitives and composite promotions.
- This stage touches many files. Every part must list exact `Files > Update` targets — no wildcard sweeps.
