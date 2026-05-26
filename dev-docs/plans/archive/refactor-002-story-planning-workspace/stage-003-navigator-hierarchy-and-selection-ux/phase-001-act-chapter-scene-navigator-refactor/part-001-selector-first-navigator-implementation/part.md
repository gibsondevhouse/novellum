---
title: Selector First Navigator Implementation
slug: part-001-selector-first-navigator-implementation
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-act-chapter-scene-navigator-refactor
started_at: ~
completed_at: ~
estimated_duration: 4d
---

## Objective

Replace the current chapter-centric outline list with a structured, selector-first navigator that supports act-aware planning and clear focus state.

## Scope

**In scope:**

- Act/chapter/scene tree component and expand-collapse controls
- Strong selected-state styling and context breadcrumbs
- Utility action containment to reduce visual competition with selection

**Out of scope:**

- Beat editing UI
- Story Frame content editing

## Implementation Steps

1. Extract navigator concerns from route into module-level components.
2. Implement Act group rendering and chapter/scene nesting.
3. Introduce explicit selected node state and keyboard navigation handlers.
4. Move secondary controls into contextual menus or compact action rails.
5. Validate pointer + keyboard selection parity.

## Files

**Create:**

- src/modules/outliner/components/HierarchyNavigator.svelte
- src/modules/outliner/components/ActGroup.svelte

**Update:**

- src/modules/outliner/components/ChapterGroup.svelte
- src/modules/outliner/components/SceneRow.svelte
- src/modules/outliner/stores/outliner.svelte.ts
- src/routes/projects/[id]/outline/+page.svelte

## Acceptance Criteria

- [ ] Tree rendering supports nested act/chapter/scene groups
- [ ] Selected state remains accurate across add, delete, and reorder actions
- [ ] Utility controls are de-emphasized without losing discoverability

## Edge Cases

- Deeply nested expansion should not cause layout jumps.
- Selection should recover safely after deleting the active item.

## Notes

Avoid introducing route-level business logic while extracting hierarchy behavior.
