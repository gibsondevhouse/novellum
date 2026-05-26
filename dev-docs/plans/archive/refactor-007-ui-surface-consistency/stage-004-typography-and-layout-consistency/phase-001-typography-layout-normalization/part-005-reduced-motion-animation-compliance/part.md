---
title: Reduced-motion animation compliance
slug: part-005-reduced-motion-animation-compliance
part_number: 5
status: draft
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-typography-layout-normalization
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Ensure all relevant animations respect reduced-motion preferences across touched surfaces.

## Scope

**In scope:**

- Animation and transition compliance with reduced-motion accessibility preference

**Out of scope:**

- Animation redesign beyond compliance enforcement

## Implementation Steps

1. Inventory existing animation declarations in scoped surfaces
2. Add or normalize reduced-motion fallbacks where missing
3. Capture grep and visual evidence for reduced-motion compliance

## Files

**Create:**

- dev-docs/plans/refactor-007-ui-surface-consistency/stage-004-typography-and-layout-consistency/phase-001-typography-layout-normalization/part-005-reduced-motion-animation-compliance/evidence/

**Update:**

- src/routes/**/*.svelte; src/modules/**/*.svelte; src/styles/**/*.css

## Acceptance Criteria

- [ ] Animation behaviors respect reduced-motion preference on all touched surfaces.
- [ ] No animation-related regressions appear in normal motion mode.

## Edge Cases

- Third-party transitions may require wrapper-level overrides and explicit notes.

## Notes

This part is styling and navigation scoped only and must not absorb refactor-006 resilience or security work.
