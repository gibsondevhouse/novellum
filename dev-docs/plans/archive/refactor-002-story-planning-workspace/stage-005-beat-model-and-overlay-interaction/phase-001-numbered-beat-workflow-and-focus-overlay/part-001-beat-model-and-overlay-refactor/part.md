---
title: Beat Model and Overlay Refactor
slug: part-001-beat-model-and-overlay-refactor
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-numbered-beat-workflow-and-focus-overlay
started_at: ~
completed_at: ~
estimated_duration: 3d
---

## Objective

Simplify beat interaction by removing title-heavy beat rows and introducing a focused overlay that keeps editing context clear.

## Scope

**In scope:**

- Numbered beat model in chapter and scene contexts
- Focused beat overlay sizing, placement, and keyboard behavior
- Shared beat components for both planning contexts

**Out of scope:**

- Beat analytics and telemetry
- Act-level beat aggregation UI

## Implementation Steps

1. Update beat type contract and component assumptions to support numbered units.
2. Refactor beat list rendering and add/remove behavior.
3. Build focused beat overlay component and integrate with card shell.
4. Ensure keyboard focus traps and escape/close behavior are predictable.
5. Validate shared component behavior in chapter and scene workflows.

## Files

**Create:**

- src/modules/outliner/components/beats/BeatOverlay.svelte
- src/modules/outliner/components/beats/BeatNumberField.svelte

**Update:**

- src/modules/outliner/components/BeatList.svelte
- src/modules/outliner/components/BeatItem.svelte
- src/modules/outliner/components/ChapterOutlineForm.svelte
- src/modules/outliner/components/SceneOutlineForm.svelte

## Acceptance Criteria

- [ ] Beats render and persist as ordered numbered units
- [ ] Overlay interaction supports keyboard and pointer without focus loss
- [ ] Chapter and scene forms reuse the same beat editing primitives

## Edge Cases

- Empty beat lists should still offer clear first-action affordances.
- Removing the active beat should select a deterministic fallback.

## Notes

Keep overlay dimensions intentionally smaller than the parent planning card.
