---
title: Remove Project Header
slug: part-001-remove-project-header
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-header-removal-and-action-migration
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Remove the `.project-header` element and all its children from the project layout (`src/routes/projects/[id]/+layout.svelte`). Delete `ProjectModeSwitcher.svelte`. Clean up all associated CSS, imports, and barrel exports so the project layout is header-free.

## Context

- `src/routes/projects/[id]/+layout.svelte` currently renders:
  1. `<header class="project-header">` — project title, genre tags, edit/export/delete toolbar (`project-utils`)
  2. `<ProjectModeSwitcher projectId={...} />` — horizontal tab bar (Hub, Editor, Outline, Bible, Consistency)
  3. `<div class="mode-content">` — child route content frame (this must be preserved)
- `ProjectModeSwitcher.svelte` is in `src/lib/components/`; it is exported from `index.ts`
- With the sidebar handling all surface navigation, both the header and the tab bar are now obsolete

## Scope

**In scope:**

- Remove the `<header class="project-header">` block and all its contents
- Remove the `<ProjectModeSwitcher>` component usage and its import
- Remove associated CSS: `.project-header`, `.project-title`, `.project-utils`, `.mode-content` top padding if set by header
- Delete `src/lib/components/ProjectModeSwitcher.svelte`
- Remove `ProjectModeSwitcher` from `src/lib/components/index.ts`

**Out of scope:**

- Utility action migration to Hub page — Part 002 of this phase
- Root layout changes — Phase 003

## Implementation Steps

1. Open `src/routes/projects/[id]/+layout.svelte`:
   - Remove the entire `<header class="project-header">` block
   - Remove `<ProjectModeSwitcher ... />` line
   - Remove import statement for `ProjectModeSwitcher`
   - Remove import for any store or context only used by the header (verify no other usage)
   - Preserve `<div class="mode-content">` or equivalent content frame for child routes

2. Delete `src/lib/components/ProjectModeSwitcher.svelte`

3. Update `src/lib/components/index.ts`:
   - Remove: `export { default as ProjectModeSwitcher } from './ProjectModeSwitcher.svelte'`

4. Clean up layout CSS:
   - Remove `.project-header`, `.project-title`, `.project-utils` styles
   - Check if `.mode-content` had top padding or margin set relative to header height — remove that offset

5. Verify no other files import `ProjectModeSwitcher` — run a grep search for `ProjectModeSwitcher` across `src/`

## Files

**Update:**

- `src/routes/projects/[id]/+layout.svelte` — remove header + ProjectModeSwitcher
- `src/lib/components/index.ts` — remove ProjectModeSwitcher export

**Delete:**

- `src/lib/components/ProjectModeSwitcher.svelte`

## Acceptance Criteria

- [ ] `src/routes/projects/[id]/+layout.svelte` renders no `<header>` element
- [ ] `ProjectModeSwitcher.svelte` file deleted
- [ ] `ProjectModeSwitcher` removed from `index.ts` exports
- [ ] No remaining references to `ProjectModeSwitcher` anywhere in `src/`
- [ ] Project layout still renders child route content via `<slot>` or content frame
- [ ] `pnpm run check` exits clean

## Edge Cases

- If `ProjectModeSwitcher` is imported in any page file other than the layout, those imports will also need removal
- The content frame (`.mode-content`) must survive — child routes rely on it for layout

## Notes

- Utility actions (edit, export, delete) from the removed header toolbar are handled in Part 002 — do not add them back to the layout
- After this part completes, visiting a project route will show no top navigation — this is the expected intermediate state until the sidebar is wired in Phase 003
