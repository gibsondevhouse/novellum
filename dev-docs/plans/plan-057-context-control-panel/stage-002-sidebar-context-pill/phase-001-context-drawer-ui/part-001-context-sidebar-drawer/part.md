---
title: Context Sidebar Drawer Component
slug: part-001-context-sidebar-drawer
part_number: 1
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-context-drawer-ui
started_at: 2026-06-28
completed_at: 2026-06-28
estimated_duration: 2d
---

## Objective

Design context visualisation drawer displaying token estimates and overrides.

## Scope

**In scope:**

- Visual token indicators.
- Expose list of toggle chips.

**Out of scope:**

- Custom vector tuning controls.

## Implementation Steps

1. Build Svelte drawer in Nova panels.
2. Wire controls to override stores.

## Files

**Create:**

- `src/modules/nova/components/ContextSidebarDrawer.svelte`
- `src/modules/nova/stores/context-control.svelte.ts`

**Update:**

- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/index.ts`
- `tests/nova/context-sidebar-drawer.test.ts`

## Acceptance Criteria

- [x] Token bar visual changes correctly.
- [x] Pins toggle chips state.

## Edge Cases

- Excessive entities checked: warning indicators render in orange/red.

## Notes

> Part-level context for Context Sidebar Drawer Component.
