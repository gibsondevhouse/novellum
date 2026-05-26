---
title: Workspace Sidebar & Data Flow
slug: part-002-workspace-sidebar-and-data-flow
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-workspace-surface
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Verify the Workspace sidebar item shows active state when on the `/workspace` route and all sub-routes. Verify scene navigation from `HierarchyNavigator` (Workspace) to the Editor still works after the route rename. Document the Workspace data flow responsibilities.

## Context

- `ActiveProjectSection` was built with `href="{base}/workspace"` — active state uses `startsWith` matching
- `HierarchyNavigator` in `src/modules/outliner/components/` likely has `<a href="/projects/{id}/editor/{sceneId}">` links to navigate to the Editor surface
- These links must still work after the Workspace route rename (editor route unchanged)
- Data flow documentation belongs in `dev-docs/context-docs/frontend.md` or equivalent

## Scope

**In scope:**

- Verify `HierarchyNavigator` scene links still navigate to Editor at `/projects/[id]/editor/[sceneId]`
- Verify `ActiveProjectSection` Workspace item is active on the new route
- Document Workspace data flow in the frontend context doc

**Out of scope:**

- Component changes to `HierarchyNavigator`
- Editor route changes (not in this stage)

## Implementation Steps

1. Open `src/modules/outliner/components/HierarchyNavigator.svelte` (or similar scene-linking component):
   - Find any navigation links to the editor surface
   - Verify they use `/projects/${id}/editor/${sceneId}` (no `/outline` or `/workspace` in the editor path)
   - If hardcoded paths reference any route names that have changed, update them

2. Verify in browser: from the Workspace surface, click a scene in `HierarchyNavigator`. Confirm it navigates to the Editor at the correct URL.

3. Update `dev-docs/context-docs/frontend.md`:
   - Add "Workspace Data Flow" section:
     - **Workspace → Editor:** clicking a scene in `HierarchyNavigator` navigates to `/projects/[id]/editor/[sceneId]`. The scene ID is passed as a URL param; the Editor loads the full scene from Dexie.
     - **Workspace → Outline (future):** the act/chapter/scene hierarchy in the workspace Dexie tables is the source for the future compiled Outline surface. No implementation yet.
     - **World Building → Workspace:** entity names and lore from World Building tables are available as reference context in Workspace (future concern; document intent now).

## Files

**Update:**

- `src/modules/outliner/components/HierarchyNavigator.svelte` — only if any path references are wrong
- `dev-docs/context-docs/frontend.md` — add Workspace data flow section

## Acceptance Criteria

- [ ] Workspace sidebar item is active when URL is `/projects/[id]/workspace` or any sub-path
- [ ] Clicking a scene in `HierarchyNavigator` navigates to Editor at correct URL
- [ ] Workspace data flow documented in frontend context doc
- [ ] `pnpm run check` exits clean

## Edge Cases

- If `HierarchyNavigator` derives the editor URL from a helper function, verify that helper produces the correct path after any module changes

## Notes

- This is primarily a verification and documentation part — expect minimal code changes unless `HierarchyNavigator` had hardcoded path assumptions
