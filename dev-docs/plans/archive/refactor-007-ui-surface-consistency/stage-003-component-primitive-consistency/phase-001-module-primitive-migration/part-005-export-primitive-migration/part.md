---
title: Export module primitive migration
slug: part-005-export-primitive-migration
part_number: 5
status: draft
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-module-primitive-migration
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Replace ad-hoc raw elements in the Export module with shared Novellum surface and button primitives.

## Scope

**In scope:**

- Primitive migration in module views and components where raw styled elements are currently used

**Out of scope:**

- Token-only value replacement was handled in Stage 002

## Implementation Steps

1. Inventory current raw element patterns (button, styled div, inline-style surfaces)
2. Migrate to PrimaryButton, GhostButton, SurfaceCard, SurfacePanel, and SectionHeader
3. Capture before/after component inventory diff in evidence directory

## Files

**Create:**

- dev-docs/plans/refactor-007-ui-surface-consistency/stage-003-component-primitive-consistency/phase-001-module-primitive-migration/part-005-export-primitive-migration/evidence/

**Update:**

- src/modules/export/**; src/lib/components/**; src/routes/**

## Acceptance Criteria

- [ ] Scoped Export module uses approved primitives for actions and surface wrappers.
- [ ] No regressions in interaction behavior or route rendering.

## Edge Cases

- Third-party wrappers may require adapter components when direct primitive substitution is not possible.

## Notes

This part is styling and navigation scoped only and must not absorb refactor-006 resilience or security work.
