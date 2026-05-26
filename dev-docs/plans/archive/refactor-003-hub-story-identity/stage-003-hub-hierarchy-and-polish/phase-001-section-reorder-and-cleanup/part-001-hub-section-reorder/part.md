---
title: Hub Section Reorder
slug: part-001-hub-section-reorder
part_number: 1
status: complete
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-section-reorder-and-cleanup
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Reorder the DOM sections in `+page.svelte` to match the 5-layer Hub hierarchy, replace the two-column `.hub-grid` with a single-column vertical stack, and wrap the lower sections (progress, next action, metadata) in a unified lower-frame container with consistent spacing.

## Context

Current DOM order in `+page.svelte`:

```text
.hub
  .hub-grid
    .hub-primary
      section.story-block      ← removed in stage-001
      section.progress-module
    aside.hub-secondary
      a.action-card
      section.metadata-panel
```

Target DOM order (after this part):

```text
.hub
  ProjectHubHero              ← rendered in stage-001
  StructuralMetricsCarousel   ← rendered in stage-002
  .hub-lower
    section.progress-module
    a.action-card
    section.metadata-panel
```

The `.hub-grid`, `.hub-primary`, `.hub-secondary` wrappers are removed. The lower three sections are wrapped in `.hub-lower` — a single-column block with `gap: var(--space-6)`.

## Scope

**In scope:**

- Remove `.hub-grid`, `.hub-primary`, `.hub-secondary` wrapper elements from `+page.svelte`
- Introduce `.hub-lower` container for the three lower sections
- Remove defunct CSS classes from `<style>` block
- Keep progress, action-card, and metadata sections visually intact (no style changes to their internals)

**Out of scope:**

- Style changes to `.progress-module`, `.action-card`, or `.metadata-panel` internals
- Responsive polish (→ part-002)

## Implementation Steps

1. Open `+page.svelte`; locate and remove `<div class="hub-grid">`, `<div class="hub-primary">`, and `<aside class="hub-secondary">` wrapper elements (keeping their children)

1. Wrap `section.progress-module`, `a.action-card`, and `section.metadata-panel` in `<div class="hub-lower">`

1. Update `<style>` — remove `.hub-grid`, `.hub-primary`, `.hub-secondary` rules; add `.hub-lower` rule:

```css
.hub-lower {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 680px;
}
```

1. Ensure overall `.hub` container has `display: flex; flex-direction: column; gap: var(--space-8)` so the four layers stack with consistent spacing

## Files

**Update:**

- `src/routes/projects/[id]/+page.svelte`

## Acceptance Criteria

- [ ] DOM order is: hero → metrics → progress → action-card → metadata
- [ ] `.hub-grid`, `.hub-primary`, `.hub-secondary` do not appear in the rendered HTML
- [ ] Progress bar, action card, and metadata panel render correctly with no visual regression
- [ ] `.hub-lower` max-width of 680px keeps lower content from stretching too wide on large screens
- [ ] `pnpm run check` exits clean; `pnpm run lint` exits clean

## Notes

- The `aside.hub-secondary` was previously `position: sticky; top: var(--space-8)` — remove this sticky behaviour; it is no longer appropriate in a single-column layout
