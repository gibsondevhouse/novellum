---
title: Scene Navigation in Sidebar Context
slug: part-002-scene-navigation-in-sidebar-context
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-editor-surface-integration
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Establish and enforce the architectural rule that defines where scene navigation lives: inside the Editor content area, not in the sidebar. Verify that no scene-level items bleed into the sidebar. Document this navigation boundary in the frontend context doc.

## Context

- The sidebar handles surface-level navigation only: Hub, Workspace, Editor, World Building, Continuity
- Inside the Editor surface, scene navigation is the responsibility of the Editor content area (chapter list, scene list, or intra-editor scene switcher)
- The `HierarchyNavigator` in the Workspace surface lists scenes for structural planning — clicking a scene navigates to the Editor at that scene's URL
- Once in the editor, the user navigates between scenes via the editor landing page or a side panel within the editor surface itself — not via the global sidebar

## Scope

**In scope:**

- Verify `HierarchyNavigator` (Workspace) clicking a scene navigates correctly to the Editor
- Verify no scene entries appear in the sidebar's Active Project section
- If the editor has a chapter/scene panel, confirm it lives within the editor content frame
- Document the navigation boundary rule in `dev-docs/context-docs/frontend.md`

**Out of scope:**

- Building a new scene panel for the editor (if one doesn't exist, the landing page from Part 001 is sufficient)
- Adding AI or editing features to the scene navigation

## Implementation Steps

1. Confirm `ActiveProjectSection` contains exactly five items: Hub, Workspace, World Building, Continuity, Outline (locked). Verify no dynamic scene items are injected into the sidebar.

2. If there is an in-editor scene sidebar panel (e.g., a left drawer inside the editor content area showing chapter/scene list), verify it is:
   - Rendered inside `src/routes/projects/[id]/editor/[sceneId]/+page.svelte` or its layout
   - NOT rendered through the global `AppSidebar` — it must be part of the editor content area only

3. Write the navigation boundary rule in `dev-docs/context-docs/frontend.md`:

   > **Navigation Boundary Rule (enforced)**
   >
   > The global sidebar (`AppSidebar`) handles only surface-level navigation. It contains:
   > - GLOBAL items: Home, Nova, Images, Styles
   > - PROJECTS items: Books, Stories
   > - ACTIVE PROJECT items: Hub, Workspace, World Building, Continuity, Outline
   >
   > Scene-to-scene navigation, chapter lists, entity detail navigation, and any in-surface sub-navigation are managed within the surface's own content area.
   >
   > No surface-specific sub-items (scenes, chapters, entities, beat cards) are ever added to `AppSidebar` or `ActiveProjectSection`.

4. Ensure the Editor surface communicates clearly to the user that they can navigate between scenes:
   - From the Workspace: click a scene in `HierarchyNavigator` → goes to Editor at that scene
   - From the Editor landing page: click a scene in the chapter/scene list
   - Within an open scene: provide a back/chapter-list affordance (existing or new) within the editor content frame

## Files

**Update:**

- `dev-docs/context-docs/frontend.md` — add navigation boundary rule

**Review only (no expected changes unless broken):**

- `src/lib/components/ActiveProjectSection.svelte` — verify no scene items
- `src/routes/projects/[id]/editor/[sceneId]/+page.svelte` — verify any scene panel is scoped to editor content

## Acceptance Criteria

- [ ] Sidebar Active Project section contains exactly five items — no scene or chapter entries
- [ ] Scene navigation within Editor is handled by content-area components, not the sidebar
- [ ] `HierarchyNavigator` → Editor scene navigation still functions correctly
- [ ] Navigation boundary rule documented in frontend context doc
- [ ] `pnpm run check` exits clean

## Edge Cases

- If a future developer adds scene items to the sidebar, the boundary documentation and this checklist serve as the enforcement record
- If the Editor's `[sceneId]` layout has its own `<aside>` for scene navigation, this is acceptable — it is scoped to the editor layout, not the global sidebar

## Notes

- This part is primarily a verification and documentation task — minimal code changes expected
- The navigation boundary rule is a product architecture constraint, not just a UI preference
