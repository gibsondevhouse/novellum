---
title: Outline Merge Tree Component
slug: part-001-outline-tree-component
part_number: 1
status: complete
owner: Planner Agent
assigned_to: —
phase: phase-001-tree-diff-ui
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: undefined
---

## Objective

Design visual Svelte component rendering the diff tree with selective checkbox selections.

## Scope

**In scope:**

- Render tree elements hierarchy: Acts -> Chapters -> Scenes.
- Add select controls and highlight styling.

**Out of scope:**

- Manual editing of individual text inside tree view.

## Implementation Steps

1. Develop Svelte components under src/modules/nova/components/.
2. Integrate tree controls in NovaOutlineDraftCheckpointCard.svelte.

## Files

**Create:**

- `src/modules/nova/components/OutlineMergeTree.svelte`
- `tests/nova/OutlineMergeTree.svelte.test.ts`

**Update:**

- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`

## Acceptance Criteria

- [x] Checkboxes update selections list.
- [x] Layout tokens match styling.

## Edge Cases

- Checking children elements: auto-check parent act/chapter nodes.

## Notes

> Part-level context for Outline Merge Tree Component.
