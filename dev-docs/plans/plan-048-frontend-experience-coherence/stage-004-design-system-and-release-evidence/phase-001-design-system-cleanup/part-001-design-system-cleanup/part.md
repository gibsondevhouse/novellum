---
title: Design System Cleanup
slug: part-001-design-system-cleanup
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-001-design-system-cleanup
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Reduce visual inconsistency by consolidating repeated UI patterns into existing components and design primitives.

## Scope

**In scope:**

- Audit repeated card, panel, empty state, status, toolbar, and dialog patterns.
- Consolidate duplicated component logic where there is a clear shared contract.
- Clean CSS token usage and interaction states touched by this plan.

**Out of scope:**

- Rebranding the app.
- Replacing all module-specific components with generic abstractions.

## Implementation Steps

1. Use the stage 001 inventory to identify high-value repeated patterns.
2. Choose existing primitives or small focused components for consolidation.
3. Update affected components and tests incrementally.
4. Run CSS, token, type, and unit quality gates.
5. Save cleanup evidence under this part.

## Files

**Create:**

- `evidence/design-system-cleanup-2026-06-09.md`

**Update:**

- `src/lib/components`
- `src/lib/components/planning`
- `src/modules/ai/components`
- `src/modules/editor/components`
- `src/modules/nova/components`
- `src/modules/world-building/components`
- `src/modules/export/components`
- `tests/lib/ui-primitives.test.ts`
- `tests/lib/pill-toolbar.test.ts`
- `tests/components`

**Reference:**

- `src/app.css`
- `src/lib/styles`
- `tests/lib/sidebar-navigation.test.ts`
- `tests/nova/nova-panel-tools.test.ts`

## Acceptance Criteria

- [ ] Repeated controls, status chips, cards, empty states, and panel patterns are consolidated where practical.
- [ ] Token and CSS checks remain clean.
- [ ] Changes preserve dense, work-focused authoring surfaces.

## Edge Cases

- Some module-specific panels may look similar but carry different domain semantics.
- Over-abstraction can make future agent review surfaces harder to maintain.

## Notes

Consolidate for clarity and maintainability, not for visual sameness alone.
