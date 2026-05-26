---
title: Font family token alignment
slug: part-001-font-family-token-alignment
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-typography-layout-normalization
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Align all component font declarations to the approved font tokens.

## Scope

**In scope:**

- Font family normalization in component and route styles

**Out of scope:**

- Text-scale and spacing normalization tracked in sibling parts

## Implementation Steps

1. Search for raw font-family stacks and classify violations
2. Replace with approved font tokens and validate visual intent
3. Capture before/after grep evidence with zero raw stack strings

## Files

**Create:**

- dev-docs/plans/refactor-007-ui-surface-consistency/stage-004-typography-and-layout-consistency/phase-001-typography-layout-normalization/part-001-font-family-token-alignment/evidence/

**Update:**

- src/routes/**/*.svelte; src/modules/**/*.svelte; src/styles/**/*.css

## Acceptance Criteria

- [ ] No raw font-family stack strings remain in component files.
- [ ] Typography intent is preserved across all touched surfaces.

## Edge Cases

- Third-party embedded editors may require scoped exceptions documented in evidence.

## Notes

This part is styling and navigation scoped only and must not absorb refactor-006 resilience or security work.
