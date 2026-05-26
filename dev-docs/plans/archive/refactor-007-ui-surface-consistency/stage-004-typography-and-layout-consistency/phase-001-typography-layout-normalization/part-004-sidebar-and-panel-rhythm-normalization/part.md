---
title: Sidebar and panel rhythm normalization
slug: part-004-sidebar-and-panel-rhythm-normalization
part_number: 4
status: draft
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-typography-layout-normalization
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Normalize sidebar and panel spacing rhythm so vertical cadence and section spacing are consistent across surfaces.

## Scope

**In scope:**

- Sidebar and panel spacing cadence in shared and module surfaces

**Out of scope:**

- Feature-level information architecture restructuring

## Implementation Steps

1. Audit panel and sidebar spacing against token rhythm expectations
2. Refactor divergent spacing declarations to tokenized cadence
3. Capture before/after visual diff evidence for key surfaces

## Files

**Create:**

- dev-docs/plans/refactor-007-ui-surface-consistency/stage-004-typography-and-layout-consistency/phase-001-typography-layout-normalization/part-004-sidebar-and-panel-rhythm-normalization/evidence/

**Update:**

- src/lib/components/**; src/modules/**/components/**; src/routes/projects/**

## Acceptance Criteria

- [ ] Sidebar and panel rhythm is visually consistent across audited surfaces.
- [ ] No hardcoded spacing values remain in touched sidebar and panel components.

## Edge Cases

- Sticky or fixed containers may expose hidden spacing interactions across breakpoints.

## Notes

This part is styling and navigation scoped only and must not absorb refactor-006 resilience or security work.
