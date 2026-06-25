---
title: Context Sidebar Drawer Component
slug: part-001-context-sidebar-drawer
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-context-drawer-ui
started_at: ~
completed_at: ~
estimated_duration: undefined
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

**Update:**

- `src/modules/nova/components/NovaMessageLog.svelte`

## Acceptance Criteria

- [ ] Token bar visual changes correctly.
- [ ] Pins toggle chips state.

## Edge Cases

- Excessive entities checked: warning indicators render in orange/red.

## Notes

> Part-level context for Context Sidebar Drawer Component.
