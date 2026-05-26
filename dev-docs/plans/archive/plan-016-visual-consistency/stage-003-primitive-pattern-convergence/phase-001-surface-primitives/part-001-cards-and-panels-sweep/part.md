---
title: Cards & Panels Sweep
slug: part-001-cards-and-panels-sweep
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Implement Agent
phase: phase-001-surface-primitives
started_at: 2026-04-24 07:50 EDT
completed_at: 2026-04-24 18:30 EDT
estimated_duration: 2d
---

## Objective

Replace every local re-implementation of card or panel visuals with `SurfaceCard` / `SurfacePanel`.

## Scope

**In scope:**

- Every module card/panel identified in the primitive audit (Stage 001 part 2).
- Preservation of archetype-specific padding via slot props, not local CSS.

**Out of scope:**

- Composite patterns built on top of cards (entity card, stat card) — covered in `phase-003-composite-patterns`.

## Implementation Steps

1. For each duplicate listed in the audit, open the file and replace the local element with `SurfaceCard` / `SurfacePanel`.
2. Remove local card/panel CSS.
3. Verify archetype rhythm with a screenshot.
4. Run lint, typecheck, tokens, boundaries.

## Files

**Update:**

- Files listed in Stage 001 part 2's primitive-duplication inventory under cards/panels.

## Acceptance Criteria

- [x] Zero local card/panel re-implementations remain.
- [x] Archetype rhythm preserved.
- [x] Gates pass.

## Edge Cases

- Workspace hero cards are upstream composites — do not touch them here.

## Notes

- Every touched file must be listed explicitly in `impl.log.md` before sign-off.
