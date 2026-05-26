---
title: Text scale and letter spacing normalization
slug: part-002-text-scale-and-letter-spacing-normalization
part_number: 2
status: draft
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-typography-layout-normalization
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Normalize text-size and tracking usage to approved tokenized scale and consistent letter-spacing patterns.

## Scope

**In scope:**

- Text scale and letter-spacing normalization across primary surfaces

**Out of scope:**

- Creation of new typographic scales

## Implementation Steps

1. Audit headings, body, and metadata typography patterns by surface
2. Replace divergent text-size and tracking declarations with tokenized values
3. Capture before/after visual and grep evidence

## Files

**Create:**

- dev-docs/plans/refactor-007-ui-surface-consistency/stage-004-typography-and-layout-consistency/phase-001-typography-layout-normalization/part-002-text-scale-and-letter-spacing-normalization/evidence/

**Update:**

- src/routes/**/*.svelte; src/modules/**/*.svelte; src/styles/components.css

## Acceptance Criteria

- [ ] Tokenized text-scale and letter-spacing conventions are applied consistently.
- [ ] No readability regressions are introduced.

## Edge Cases

- Very compact UI controls may require explicitly documented exceptions.

## Notes

This part is styling and navigation scoped only and must not absorb refactor-006 resilience or security work.
