---
title: Shared Shell and Card Parity Implementation
slug: part-001-shared-shell-and-card-parity-implementation
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-shared-planning-surface-extraction
started_at: ~
completed_at: ~
estimated_duration: 4d
---

## Objective

Unify planning panel structure into reusable shell components so new planning surfaces can be added without route-level duplication.

## Scope

**In scope:**

- Shared planning surface shell + card primitives
- Chapter and scene panel migration to shared primitives
- Sticky header and internal scrolling consistency fixes

**Out of scope:**

- New planning content types beyond chapter/scene
- Beat overlay internals

## Implementation Steps

1. Build planning-surface shell primitives and export through module index.
2. Migrate chapter panel to shared shell API.
3. Migrate scene panel to shared shell API and validate parity.
4. Remove duplicate layout logic from route-level components.
5. Verify split mode and single mode behavior across viewport sizes.

## Files

**Create:**

- src/modules/outliner/components/planning-surface/PlanningSurfaceShell.svelte
- src/modules/outliner/components/planning-surface/PlanningSurfaceCard.svelte
- src/modules/outliner/components/planning-surface/index.ts

**Update:**

- src/modules/outliner/components/OutlineDetailCard.svelte
- src/modules/outliner/components/ChapterOutlinePanel.svelte
- src/modules/outliner/components/SceneOutlinePanel.svelte
- src/routes/projects/[id]/outline/+page.svelte

## Acceptance Criteria

- [ ] Shared shell primitives are used by both chapter and scene panels
- [ ] Card dimensions and spacing are parity-consistent in outline and overview usage
- [ ] Internal scroll and sticky header behaviors are reliable on desktop and mobile

## Edge Cases

- Long chapter summaries should not break card layout or sticky controls.
- Switching selection rapidly should preserve scroll stability.

## Notes

Preserve current design token usage; avoid hard-coded spacing values.
