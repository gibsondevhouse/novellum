---
title: Prose width enforcement
slug: part-003-prose-width-enforcement
part_number: 3
status: draft
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-typography-layout-normalization
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Apply prose width max token consistently on prose-heavy surfaces to enforce readable line length.

## Scope

**In scope:**

- Reader and editor prose surfaces and long-form content blocks

**Out of scope:**

- Layout redesign of non-prose utility panels

## Implementation Steps

1. Identify prose surfaces missing max-width governance
2. Apply prose width max token and verify responsive behavior
3. Capture before/after screenshots demonstrating line-length improvements

## Files

**Create:**

- dev-docs/plans/refactor-007-ui-surface-consistency/stage-004-typography-and-layout-consistency/phase-001-typography-layout-normalization/part-003-prose-width-enforcement/evidence/

**Update:**

- src/routes/books/**; src/routes/projects/**; src/modules/editor/**

## Acceptance Criteria

- [ ] Prose-heavy surfaces enforce max prose width via tokenized value.
- [ ] Responsive behavior remains stable at mobile and desktop breakpoints.

## Edge Cases

- Nested containers may override prose width and cascading conflicts must be resolved.

## Notes

This part is styling and navigation scoped only and must not absorb refactor-006 resilience or security work.
