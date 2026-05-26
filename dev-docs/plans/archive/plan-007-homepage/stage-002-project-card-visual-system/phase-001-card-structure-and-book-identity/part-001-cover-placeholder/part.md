---
title: Cover Placeholder
slug: part-001-cover-placeholder
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-card-structure-and-book-identity
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Add a 2:3 aspect-ratio cover block to the top of `ProjectCard`, establishing the card's visual anchor — the slot where a real book cover will eventually live. The placeholder must feel designed, not empty.

## Scope

**In scope:**

- Restructure `ProjectCard` layout to `flex-direction: column`
- Add `.card-cover` block at the top: `aspect-ratio: 2/3`, `width: 100%`, `background-color: var(--color-surface-elevated)`, inner `box-shadow: inset 0 0 0 1px var(--color-border-subtle)`, `border-radius: var(--radius-sm) var(--radius-sm) 0 0`
- Cover sits outside the `.card-btn` padding area — it is a full-bleed sibling above the content block, or part of the button but with its own zero-padding wrapper
- Update `ProjectCardSkeleton` `.skeleton-cover` to use the same `aspect-ratio: 2/3` so dims match

**Out of scope:**

- Image upload, drag-and-drop, or `<img>` rendering (future milestone)
- Cover icon or monogram initials overlay (future polish, not this part)

## Implementation Steps

1. In `ProjectCard.svelte`, change the outer `<li>` to `flex-direction: column`
2. Before the `.card-btn`, add:

   ```html
   <div class="card-cover" aria-hidden="true"></div>
   ```

3. In `<style>`, add `.card-cover` rules: `aspect-ratio: 2/3`, `width: 100%`, `background-color: var(--color-surface-elevated)`, `box-shadow: inset 0 0 0 1px var(--color-border-subtle)`, `border-radius: var(--radius-sm) var(--radius-sm) 0 0`, `flex-shrink: 0`
4. Remove any `height` constraint from `.project-card` that would clip the cover
5. In `ProjectCardSkeleton.svelte`, update `.skeleton-cover` to `aspect-ratio: 2/3` (remove any `padding-bottom` fallback if already using `aspect-ratio`)
6. Run `pnpm run lint` and `pnpm run check`

## Files

**Update:**

- `src/modules/project/components/ProjectCard.svelte`
- `src/modules/project/components/ProjectCardSkeleton.svelte`

## Acceptance Criteria

- [ ] Cover block fills the full card width at a 2:3 ratio (portrait book proportion)
- [ ] Cover uses `--color-surface-elevated` (slightly lighter than card surface)
- [ ] Card body content (title, etc.) appears below the cover with consistent padding
- [ ] `aria-hidden="true"` on the cover div (purely decorative)
- [ ] Skeleton cover block matches real card cover dimensions
- [ ] Zero lint and type errors

## Edge Cases

- `aspect-ratio: 2/3` has wide browser support (Safari ≥15, Chrome ≥88, Firefox ≥89); no fallback needed for this project's target baseline
- The cover div must not be a focusable or interactive element — `aria-hidden="true"` and no `tabindex`

## Notes

- `aspect-ratio: 2/3` is equivalent to a portrait book cover (`width:height = 2:3`). This is intentional.
- Do not use `padding-bottom: 150%` hack; `aspect-ratio` is the correct modern approach and is already in the project's browser baseline.
