---
title: Editorial Column and Grid
slug: part-002-editorial-column-and-grid
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-header-and-layout
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Establish a visually constrained, centred editorial column and a responsive CSS Grid for the project list — the structural backbone the card overhaul in Stage 002 will build upon.

## Scope

**In scope:**

- `.project-hub` max-width constraint: `960px`, `margin: 0 auto`, horizontal `padding: var(--panel-padding)`
- `.project-grid` converted to `display: grid` with `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` and `gap: var(--space-5)`
- Explicit breakpoint overrides: 2-column at 768px, 1-column at 640px (via `@media`)
- `padding-top` on `.project-hub` to give the header breathing room (`var(--space-10)`)

**Out of scope:**

- Sidebar or shell layout changes (`.app-shell`, `+layout.svelte`)
- Card internals (Stage 002 scope)

## Implementation Steps

1. In `src/routes/+page.svelte` `<style>`, update `.project-hub` to add `padding: var(--space-10) var(--panel-padding) var(--space-8)`
2. Update `.project-grid` to use `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, `gap: var(--space-5)`, `list-style: none`, `padding: 0`, `margin: 0`
3. Add media query `@media (max-width: 640px)` overriding `.project-grid` to `grid-template-columns: 1fr`
4. Verify `role="list"` is present on `.project-grid` (already exists; do not remove)
5. Run `pnpm run lint` and `pnpm run check`

## Files

**Update:**

- `src/routes/+page.svelte`

## Acceptance Criteria

- [ ] At ≥1024px viewport, project grid displays 3 cards per row
- [ ] At 768px–1023px, grid is 2 columns
- [ ] At ≤640px, grid is 1 column
- [ ] Page column is visually centred with consistent horizontal gutters
- [ ] Zero lint and type errors

## Edge Cases

- With 1 project card, the grid must not stretch the single card to full column width in multi-column breakpoints — `minmax(280px, 1fr)` with `auto-fill` handles this correctly; verify in browser
- `ProjectCreateCard` renders outside the grid (it is a modal/overlay, not a list item); no grid changes needed for it

## Notes

- `--panel-padding` is `var(--space-4)` (16px) — confirmed in `design-system.md`. At ≤640px this is the horizontal gutter.
- `var(--space-5)` gap (20px) matches the card separation used on the Project Hub metrics carousel for visual consistency.
