---
title: Derive & Persist Pending State
slug: part-001-derive-and-persist-pending-state
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Planner Agent
phase: phase-001-derive-pending-suggestion-state
started_at: 2026-05-31
completed_at: 2026-05-31
estimated_duration: 0.75d
---

## Objective

Implement category-scoped pending suggestion state derivation and persistence/reload behavior.

## Scope

**In scope:**

- Selectors/state derivation and rehydration for pending suggestion indicators

**Out of scope:**

- Accept/reject mutation wiring

## Implementation Steps

1. Define pending-state selectors from proposal lifecycle data
2. Persist/reload pending state through existing metadata/checkpoint data
3. Add stale-state prevention and recompute hooks

## Files

**Create:**

- src/modules/world-building/stores/worldbuild-suggestion-state.svelte.ts

**Update:**

- src/modules/world-building/stores/world-building-store.svelte.ts

## Acceptance Criteria

- [x] Pending state is deterministic and category-scoped
- [x] Pending state recovers correctly after reload and navigation

## Edge Cases

- Notification state lags after accept/reject operations

## Notes

State derivation must not rely on transient component-only memory.
