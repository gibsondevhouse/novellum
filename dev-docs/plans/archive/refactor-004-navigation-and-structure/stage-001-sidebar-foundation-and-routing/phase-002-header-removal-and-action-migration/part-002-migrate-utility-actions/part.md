---
title: Migrate Utility Actions
slug: part-002-migrate-utility-actions
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-header-removal-and-action-migration
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Move the project utility actions (Edit, Export, Delete) from the now-removed header toolbar into the Hub surface page. These are project-level actions that belong on the Hub, which is the story identity and command surface. They must be accessible without cluttering the hero presentation.

## Context

- The Hub page exists at `src/routes/projects/[id]/+page.svelte` (will move to `/hub` in Stage 002 — for now, edit in place)
- `openEdit` is available via `getContext('projectActions')` in the project layout — the Hub page already uses this
- `openDelete` (or similar) may come from the same context key or a separate context
- Export functionality lives in `src/modules/export/` — an export modal or action trigger exists
- The `DeleteProjectDialog.svelte` component is in `src/modules/project/components/`
- Design principle: the Hub is presentation-first; utility actions must be visually de-emphasised (secondary/ghost buttons or an overflow menu)

## Scope

**In scope:**

- Add a `<div class="hub-actions">` area to the Hub page with Edit, Export, and Delete buttons
- Wire Edit to `openEdit()` from project context
- Wire Export to export store/service open method
- Wire Delete to `openDelete()` from project context (or render `DeleteProjectDialog` with trigger)
- Style actions as ghost/secondary buttons — not primary CTAs

**Out of scope:**

- Redesigning the export modal or delete dialog
- Moving actions to the sidebar (actions stay in the Hub content area)
- Creating a new `ProjectActionsBar` component (inline within Hub page is acceptable at ≤150 lines)

## Implementation Steps

1. In the Hub `+page.svelte`, after the hero section and below any metrics carousel, add a horizontal action row:

   ```html
   <div class="hub-actions">
     <button class="btn btn--ghost" onclick={openEdit}>Edit Project</button>
     <button class="btn btn--ghost" onclick={openExport}>Export</button>
     <button class="btn btn--ghost btn--danger" onclick={openDelete}>Delete Project</button>
   </div>
   ```

2. Retrieve `openEdit` and `openDelete` from context:

   ```ts
   const { openEdit, openDelete } = getContext('projectActions');
   ```

   - If `openDelete` is not in the existing context, use the existing `DeleteProjectDialog` component with a local `$state(false)` boolean to control its visibility

3. For Export: find the existing export trigger — it may be a store method like `exportStore.open()` or a component. Wire the button to the same trigger that the old header button used.

4. Hub actions CSS:
   - `.hub-actions`: `display: flex; gap: var(--space-3); margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--color-border-default)`
   - Buttons use existing `btn btn--ghost` classes from the design system

5. Verify the Hub page stays ≤150 lines after this addition

## Files

**Update:**

- `src/routes/projects/[id]/+page.svelte` — add hub-actions area with three utility buttons

## Acceptance Criteria

- [ ] Edit, Export, and Delete actions present on Hub page
- [ ] Edit button triggers the existing edit modal (via `openEdit()` context call)
- [ ] Delete button triggers the existing delete dialog
- [ ] Export button triggers the existing export flow
- [ ] Actions are styled as ghost/secondary — not primary CTAs
- [ ] Hub page stays ≤150 lines
- [ ] `pnpm run check` exits clean

## Edge Cases

- If `openDelete` is not in the `projectActions` context, render `<DeleteProjectDialog bind:open={showDelete} />` and toggle `showDelete` with a local state variable

## Notes

- These actions are temporarily in `+page.svelte` at the old route; they will be naturally moved to `/hub/+page.svelte` in Stage 002 Part 001 — no rework needed, just copy the content
- Keep the actions visually de-emphasised: this is the Hub, not a settings panel. The story hero must dominate the screen.
