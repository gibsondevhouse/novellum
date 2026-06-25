---
title: Split-Screen Prose Diff Panel
slug: part-001-prose-diff-panel
part_number: 1
status: complete
owner: Planner Agent
assigned_to: —
phase: phase-001-diff-split-ui
started_at: 2026-06-25
completed_at: 2026-06-25
estimated_duration: undefined
---

## Objective

Design visual split-screen component illustrating differences side-by-side.

## Scope

**In scope:**

- Split views containing color-highlighted differences.
- Add layout toggle buttons.

**Out of scope:**

- Manual input inline diff edits.

## Implementation Steps

1. Build Svelte visual panels.
2. Wire into Nova author checkpoints.

## Files

**Create:**

- `src/modules/nova/components/ProseDiffPanel.svelte`

**Update:**

- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`

## Acceptance Criteria

- [x] Side-by-side panel renders correct colors.
- [x] Toggle buttons toggle layout views cleanly.

## Edge Cases

- Very long scene files: configure virtual scrolling bounds.

## Notes

> Part-level context for Split-Screen Prose Diff Panel.
