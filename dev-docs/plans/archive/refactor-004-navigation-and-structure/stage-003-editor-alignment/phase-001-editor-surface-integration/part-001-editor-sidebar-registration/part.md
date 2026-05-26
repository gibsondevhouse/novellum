---
title: Editor Sidebar Registration
slug: part-001-editor-sidebar-registration
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-editor-surface-integration
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Verify the Editor sidebar item in `ActiveProjectSection` is correct, active for all editor sub-routes, and that the Editor page runs cleanly without the removed project header. Create a functional landing page at `/projects/[id]/editor` for when no `[sceneId]` is active.

## Context

- `ActiveProjectSection` (Stage 001 Phase 001) has an Editor item at `href="{base}/editor"`
- Active state uses `startsWith` — matches `/editor` and `/editor/[sceneId]`
- Current `src/routes/projects/[id]/editor/+page.svelte` may be a redirect to the first scene, or it may be a blank page if the editor was always accessed with a `[sceneId]`
- The removed project header was in `+layout.svelte`; the editor `+page.svelte` and `+layout.svelte` (if it has one) should be clean of header dependencies
- `DocumentEditorFrame.svelte` and `EditModeToolbar.svelte` live in `src/modules/editor/components/`

## Scope

**In scope:**

- Verify `ActiveProjectSection` Editor item and active state coverage
- Verify `src/routes/projects/[id]/editor/+page.svelte` functions without header
- Create or update `/editor` landing page: show chapter or scene list when no `[sceneId]` is active
- Remove any residual header-dependent code from editor route files

**Out of scope:**

- Editor feature additions (autocomplete, AI, etc.)
- Scene CRUD operations

## Implementation Steps

1. Open `src/routes/projects/[id]/editor/+page.svelte`:
   - Check for any `project-header` class references, `openEdit` calls unrelated to the editor, or `ProjectModeSwitcher` imports — remove them
   - If the page currently 404s or shows nothing meaningful without a `sceneId`: create a scene selection landing

2. Create scene selection landing at `/projects/[id]/editor`:
   - Query Dexie for all chapters and scenes for the current project (following existing data patterns)
   - Render a simple list of chapters with scene entries below each
   - Each scene links to `/projects/${id}/editor/${scene.id}`
   - Style using existing design tokens; keep the page ≤150 lines

3. Verify `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`:
   - Renders `DocumentEditorFrame` correctly without any layout header
   - `EditModeToolbar` still accessible within the editor content area

4. Confirm `ActiveProjectSection` Editor item active state:
   - Navigate to `/projects/[id]/editor` — Editor item should be active
   - Navigate to `/projects/[id]/editor/some-scene-id` — Editor item should remain active

## Files

**Update:**

- `src/routes/projects/[id]/editor/+page.svelte` — add scene selection landing (or verify it already exists with appropriate content)
- `src/routes/projects/[id]/editor/+page.ts` — update load if needed to fetch chapters/scenes for landing

## Acceptance Criteria

- [ ] Editor sidebar item active on `/projects/[id]/editor` (prefix match)
- [ ] Editor sidebar item active on `/projects/[id]/editor/[sceneId]` (prefix match)
- [ ] `/projects/[id]/editor` renders a chapter/scene selection list — not a blank or error page
- [ ] Each scene in the list links to `/projects/[id]/editor/[sceneId]`
- [ ] No `.project-header` or `ProjectModeSwitcher` references in editor route files
- [ ] `pnpm run check` exits clean

## Edge Cases

- If a project has zero scenes: show an empty state with a call-to-action linking to the Workspace surface
- The `[sceneId]` nested route must still function independently when accessed directly (e.g., bookmarked URL)

## Notes

- Keep the scene landing page simple — this is a navigational stepping stone, not a content feature; a clean list is sufficient
- The sidebar handles surface navigation (Hub → Workspace → Editor); the editor landing handles intra-surface navigation (editor → chapter → scene)
