---
title: Editor Alignment
slug: stage-003-editor-alignment
stage_number: 3
status: complete
owner: Frontend Agent
plan: refactor-004-navigation-and-structure
phases:
  - phase-001-editor-surface-integration
estimated_duration: 1.5d
risk_level: low
---

## Goal

Register the Editor surface in the sidebar Active Project section. Ensure active state is correct when on any editor route (`/projects/[id]/editor` or `/projects/[id]/editor/[sceneId]`). Verify the Editor page functions independently of the removed project layout header. Enforce the navigation boundary between sidebar surface-switching and in-editor scene navigation.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Editor Surface Integration](phase-001-editor-surface-integration/phase.md) | `draft` | 1.5d |

## Entry Criteria

- Stage 001 complete: `AppSidebar` renders with Active Project section
- Stage 002 complete: Hub and Workspace aligned to new routes
- Project layout header removed; Editor no longer has a top navigation bar injected by layout

## Exit Criteria

- Editor sidebar item shows active state when URL matches `/projects/[id]/editor` or `/projects/[id]/editor/[sceneId]`
- Clicking Editor in sidebar navigates to the editor landing (scene list or last active scene)
- Scene navigation lives inside the Editor surface content area — not in the sidebar
- No remnants of `ProjectModeSwitcher` or `.project-header` styles in editor routes
- `pnpm run check` exits clean

## Notes

- The Editor route (`/projects/[id]/editor/[sceneId]`) does not need renaming — it is already correct.
- The scene selection view (what a user sees when no `[sceneId]` is active) must be handled programmatically: either show a chapter/scene list within the editor content area, or redirect to the first available scene.
- The sidebar must highlight the Editor item for all sub-routes under `/editor`, not just the exact match.
