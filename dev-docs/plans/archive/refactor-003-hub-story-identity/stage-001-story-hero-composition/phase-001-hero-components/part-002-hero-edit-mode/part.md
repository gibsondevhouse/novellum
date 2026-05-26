---
title: Hero Edit Mode
slug: part-002-hero-edit-mode
part_number: 2
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-hero-components
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Ensure the hero surface is presentation-first by auditing and enforcing that all edit interactions flow through the existing `openEdit()` modal trigger. No form fields, no inline `<input>` elements, and no always-open edit state must exist anywhere in the hero component tree.

## Context

- The current `+page.svelte` calls `openEdit` from `getContext('projectActions')` — this already opens `EditProjectForm` in a modal via the layout
- As long as hero components call `onEdit()` (which is forwarded from `openEdit`), no new modal infrastructure is needed
- This part is primarily an audit + documentation of the "edit mode" contract, with a minor CSS addition for a keyboard-accessible edit button in the hero

## Scope

**In scope:**

- Verify that `ProjectHeroContent` and `ProjectHeroCover` call `onEdit()` only — no inline form fields
- Add a clearly labelled, keyboard-accessible "Edit project details" `<button>` below the synopsis in `ProjectHeroContent` (secondary ghost style, low visual emphasis)
- Document the edit mode contract in a code comment in `ProjectHubHero.svelte`

**Out of scope:**

- Building a new dedicated edit drawer (the existing modal is sufficient)
- Edit-in-place / contenteditable behaviour

## Implementation Steps

1. Add a secondary `<button class="hero-edit-btn">Edit</button>` at the bottom of `ProjectHeroContent` — triggers `onEdit()`; uses ghost button style from design system
2. Confirm that the "Add Cover" affordance in `ProjectHeroCover` also calls `onEdit()` (until cover upload is implemented)
3. Remove any `<input>` or `<textarea>` elements from the hero component tree if accidentally present
4. Add a JSDoc comment at the top of `ProjectHubHero.svelte` documenting the edit contract: all edit interactions call `onEdit()` which opens `EditProjectForm` via the `'projectActions'` context injected by `+layout.svelte`. No inline form state lives in the hero tree.

## Files

**Update:**

- `src/modules/project/components/ProjectHeroContent.svelte` — add secondary edit button below synopsis
- `src/modules/project/components/ProjectHeroCover.svelte` — confirm "Add Cover" calls `onEdit()`
- `src/modules/project/components/ProjectHubHero.svelte` — add edit contract comment

## Acceptance Criteria

- [ ] No `<input>`, `<textarea>`, or `<form>` elements exist anywhere in the hero component tree
- [ ] A secondary "Edit" button is visible below the synopsis in `ProjectHeroContent`
- [ ] Clicking "Edit" opens the `EditProjectForm` modal (calls `onEdit()`)
- [ ] "Add Cover" affordance in `ProjectHeroCover` calls `onEdit()`
- [ ] Edit button is keyboard-accessible (tab-reachable, visible focus ring)
- [ ] Edit button visual weight is clearly secondary vs. the story content above it
- [ ] `pnpm run check` exits clean

## Edge Cases

- All empty-state ghost buttons ("Add a logline", "Add a synopsis") also call `onEdit()` — not separate handlers

## Notes

- This part is small and can be done immediately after part-001 as a final pass before hero integration
- The secondary edit button label: "Edit details" (not "Edit project" or plain "Edit")
