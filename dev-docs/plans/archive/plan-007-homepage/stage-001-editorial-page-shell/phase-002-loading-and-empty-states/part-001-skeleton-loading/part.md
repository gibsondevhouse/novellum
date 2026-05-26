---
title: Skeleton Loading State
slug: part-001-skeleton-loading
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-loading-and-empty-states
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Replace the `"Loading projects…"` text with a `ProjectCardSkeleton` component that renders at the same dimensions as a real project card, eliminating CLS and communicating spatial structure during load.

## Scope

**In scope:**

- Create `src/modules/project/components/ProjectCardSkeleton.svelte` — a skeleton card matching the final `ProjectCard` dimensions (cover block + text line blocks)
- Render 3 `ProjectCardSkeleton` instances inside the project grid when `getLoading()` is `true`
- Skeleton shimmer animation (`opacity` pulse: `0.4 → 0.7 → 0.4` at 1.4s ease-in-out infinite)
- `prefers-reduced-motion` fallback: static opacity `0.5`, no animation

**Out of scope:**

- Skeleton for any other route or component
- Animated shimmer gradient (pulse only for simplicity)

## Implementation Steps

1. Create `src/modules/project/components/ProjectCardSkeleton.svelte`
   - Outer `<li class="project-card-skeleton">` matching `.project-card` padding and border-radius
   - Inner structure: `.skeleton-cover` (2:3 ratio block), `.skeleton-title`, `.skeleton-genre`, `.skeleton-logline`, `.skeleton-meta`
   - Surface: `background-color: var(--color-surface-overlay)`, `border: 1px solid var(--color-border-subtle)`
   - Blocks: `background-color: var(--color-surface-elevated)`, `border-radius: var(--radius-xs)`
   - Pulse animation scoped to `@media (prefers-reduced-motion: no-preference)`
2. In `src/routes/+page.svelte`, replace the `{#if getLoading()}` branch:
   - Remove `<p class="loading-text">Loading projects…</p>`
   - Render `<ul class="project-grid" role="list">` with 3 `<ProjectCardSkeleton />` items
3. Import `ProjectCardSkeleton` in `+page.svelte`
4. Export from `src/modules/project/index.ts` if used elsewhere
5. Run `pnpm run lint` and `pnpm run check`

## Files

**Create:**

- `src/modules/project/components/ProjectCardSkeleton.svelte`

**Update:**

- `src/routes/+page.svelte`
- `src/modules/project/index.ts` (add export)

## Acceptance Criteria

- [ ] During load, 3 skeleton cards appear in the grid at card-equivalent dimensions
- [ ] No "Loading projects…" text visible during load
- [ ] Skeleton pulse animates on devices that allow motion
- [ ] Skeleton is static (no animation) when `prefers-reduced-motion: reduce`
- [ ] Skeleton dimensions are close enough to real card dimensions that no layout shift occurs after content loads
- [ ] Zero lint and type errors

## Edge Cases

- If projects load faster than one frame (cached IndexedDB), skeleton may flash briefly — acceptable; `getLoading()` is set to `false` synchronously after `loadProjects()` resolves
- Cover block aspect ratio `2:3` must match the final `ProjectCard` cover block in Stage 002; coordinate if implementing simultaneously

## Notes

- Skeleton cover ratio: `padding-bottom: 150%` on an empty absolutely-positioned child, or use `aspect-ratio: 2/3` with a fixed `width`
- Keep the skeleton component under 50 lines; complexity belongs in the real card
