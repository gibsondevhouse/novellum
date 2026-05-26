---
title: Page Title and Actions
slug: part-001-page-title-and-actions
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-header-and-layout
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Replace the plain `<h1>Projects</h1>` with an editorial display-font heading and a muted sub-caption. Refine the action button group to use design-system variants without regressions to `showCreateForm` or `showImportDialog` state.

## Scope

**In scope:**

- `hub-header` markup: replace `h1` with a two-line heading block (`h1` title + `p` sub-caption)
- Apply `--font-display`, `--text-5xl`, `--tracking-tight`, `--color-text-primary` to the `h1`
- Apply `--font-sans`, `--text-sm`, `--color-text-muted` to the sub-caption
- "New Project" button: confirm use of `.btn-primary` token class (already exists; no change needed unless token class is missing styles)
- "Import Backup" button: ensure `.btn-ghost` class renders with correct border and text—apply `--color-border-default` border if absent

**Out of scope:**

- Sub-caption copy is provisional; final copy is a future product pass
- New button component abstraction
- Any change to `showCreateForm` / `showImportDialog` logic

## Implementation Steps

1. In `src/routes/+page.svelte`, locate the `.hub-header` block
2. Replace `<h1>Projects</h1>` with a two-line heading block (`h1.hub-title` + `p.hub-subtitle`)

3. Wrap title and subtitle in a `<div class="hub-heading">` for flex-column grouping
4. In `<style>`, add `.hub-title` (font-family, font-size, letter-spacing, color) and `.hub-subtitle` (font-size, color, margin-top)
5. Confirm `.btn-ghost` has a visible border; add `border: 1px solid var(--color-border-default)` if absent
6. Run `pnpm run lint` and `pnpm run check`

## Files

**Update:**

- `src/routes/+page.svelte`

## Acceptance Criteria

- [ ] `h1` renders in DM Serif Display (confirm via DevTools computed styles)
- [ ] Sub-caption is visible in muted text below the title
- [ ] "New Project" and "Import Backup" buttons are visually distinct (primary vs ghost)
- [ ] Clicking both buttons still triggers the correct dialog/form state
- [ ] Zero lint and type errors

## Edge Cases

- If `--font-display` is not resolved (DM Serif Display not loaded), the heading falls back to `Georgia, serif` — acceptable; font loading is a separate concern outside this part
- Sub-caption must not push the action buttons off screen on narrow viewports — the `.hub-header` flex layout may need `flex-wrap: wrap` and `gap: var(--space-3)`

## Notes

- Check `src/app.html` for the DM Serif Display `<link>` before reviewing output; if absent add it now (`<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet">` and the matching `preconnect` hints)
