---
title: Design System Cleanup
slug: part-001-design-system-cleanup
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-design-system-cleanup
started_at: 2026-06-15
completed_at: 2026-06-15
estimated_duration: 0.5h
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

- `evidence/design-system-cleanup-2026-06-15.md`

**Update:**

- `src/lib/navigation-state.ts`
- `src/lib/stores/active-context.svelte.ts`
- `src/lib/stores/active-project.svelte.ts`
- `src/lib/review-gate-labels.ts`
- `src/modules/nova/components`
- `src/modules/nova/services/tool-router.ts`
- `src/modules/world-building/components`
- `tests/lib/navigation-state.test.ts`
- `tests/lib/review-gate-labels.test.ts`
- `tests/agent-runtime/trace.test.ts`
- `tests/diagnostics/agent-runtime-diagnostics.test.ts`

**Reference:**

- `src/app.css`
- `src/lib/styles`
- `tests/lib/sidebar-navigation.test.ts`
- `tests/nova/nova-panel-tools.test.ts`

## Acceptance Criteria

- [x] Repeated controls, status chips, cards, empty states, and panel patterns are consolidated where practical.
- [x] Token and CSS checks remain clean.
- [x] Changes preserve dense, work-focused authoring surfaces.

## Edge Cases

- Some module-specific panels may look similar but carry different domain semantics.
- Over-abstraction can make future agent review surfaces harder to maintain.

## Notes

Consolidate for clarity and maintainability, not for visual sameness alone.
Status is `review` pending real Reviewer Agent sign-off.
