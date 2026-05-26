---
title: Editor Surface Integration
slug: phase-001-editor-surface-integration
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-003-editor-alignment
parts:
  - part-001-editor-sidebar-registration
  - part-002-scene-navigation-in-sidebar-context
estimated_duration: 1.5d
---

## Goal

Verify and harden the Editor surface's integration with the new sidebar navigation. Confirm active state detection covers all editor sub-routes. Ensure the editor entry point (`/projects/[id]/editor`) provides a useful landing when no `[sceneId]` is active. Enforce the navigation boundary between sidebar and in-editor scene navigation.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Editor Sidebar Registration](part-001-editor-sidebar-registration/part.md) | `draft` | Frontend Agent | 0.75d |
| 002 | [Scene Navigation in Sidebar Context](part-002-scene-navigation-in-sidebar-context/part.md) | `draft` | Frontend Agent | 0.75d |

## Acceptance Criteria

- [ ] Editor sidebar item in `ActiveProjectSection` is active on both `/projects/[id]/editor` and `/projects/[id]/editor/[sceneId]`
- [ ] Navigating to `/projects/[id]/editor` without a sceneId shows a scene/chapter selection landing — not a blank or error page
- [ ] Editor content area contains scene navigation (chapter list or scene list) — not the sidebar
- [ ] No `.project-header` or `ProjectModeSwitcher` remnants in editor route files
- [ ] `pnpm run check` exits clean

## Notes

- The Editor already lives at `/projects/[id]/editor/[sceneId]` — no route rename is required
- `ActiveProjectSection` must match active state for `/projects/[id]/editor` as a prefix, not exact path
- If the editor already renders `DocumentEditorFrame.svelte` at the `[sceneId]` level, the parent `/editor` route needs a landing page that shows available chapters/scenes
