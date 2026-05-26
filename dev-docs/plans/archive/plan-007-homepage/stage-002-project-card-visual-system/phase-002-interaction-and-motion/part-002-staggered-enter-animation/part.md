---
title: Staggered Enter Animation
slug: part-002-staggered-enter-animation
part_number: 2
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-002-interaction-and-motion
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Introduce cards into the grid using the `novellum-enter` keyframe (opacity `0→1` + `translateY(4px→0)`) with a staggered delay per card index — so the library populates with editorial settle rather than an abrupt simultaneous render.

## Scope

**In scope:**

- Apply `animation: novellum-enter var(--duration-enter) var(--ease-editorial) both` to `.project-card`
- Pass a CSS custom property `--card-index` via inline style on each `<ProjectCard>` in the grid (set by the `{#each}` index)
- Set `animation-delay: calc(var(--card-index, 0) * 40ms)` on `.project-card`, capped at `280ms` maximum via `min()`: `animation-delay: min(calc(var(--card-index, 0) * 40ms), 280ms)`
- `@media (prefers-reduced-motion: reduce)`: override animation to `none`, opacity `1`, transform `none`
- `animation-fill-mode: both` ensures cards start invisible until their delay fires

**Out of scope:**

- JavaScript-driven stagger (CSS-only via `--card-index`)
- Exit animation (cards are not removed from the DOM in a way that needs animation)

## Implementation Steps

1. In `src/routes/+page.svelte`, add `style="--card-index: {i}"` to each `<ProjectCard>` in the `{#each}` loop (using the loop index `i`)
2. Update the `{#each}` signature to `{#each getProjects() as project, i (project.id)}`
3. In `ProjectCard.svelte` `<style>`, add to `.project-card`:
   - `animation: novellum-enter var(--duration-enter) var(--ease-editorial) both`
   - `animation-delay: min(calc(var(--card-index, 0) * 40ms), 280ms)`
4. Add reduced-motion override (see below for the CSS block)
5. Confirm `@keyframes novellum-enter` is defined in `src/app.css` or `src/styles/tokens.css`; if absent, add it to `app.css` (block below)
6. Run `pnpm run lint` and `pnpm run check`

Reduced-motion override for `.project-card`:

```css
@media (prefers-reduced-motion: reduce) {
  .project-card {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

`@keyframes` block for `src/app.css` if absent:

```css
@keyframes novellum-enter {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

## Files

**Update:**

- `src/routes/+page.svelte`
- `src/modules/project/components/ProjectCard.svelte`

**Update if needed:**

- `src/app.css` (add `@keyframes novellum-enter` if not already defined)

## Acceptance Criteria

- [ ] Cards enter with a visible fade + settle animation on page load
- [ ] Cards stagger — later cards in the grid start their animation visibly after earlier ones
- [ ] Stagger delay does not exceed ~280ms for any card (even with 10+ projects)
- [ ] With `prefers-reduced-motion: reduce`, all cards appear instantly with no animation
- [ ] Cards remain fully visible after animation completes (`animation-fill-mode: both` confirmed)
- [ ] Zero lint and type errors

## Edge Cases

- After `ProjectCreateCard` triggers a new project and `loadProjects()` re-runs, cards will re-animate (the list re-renders). This is acceptable — the re-enter gives visual confirmation of the new item. If it becomes jarring, a future part can conditionally suppress animation on re-renders.
- CSS `min()` with `calc()` and `ms` units: supported in all modern browsers (Chrome 79+, Safari 11.1+, Firefox 75+) — no fallback needed

## Notes

- `--ease-editorial: cubic-bezier(0.16, 1, 0.3, 1)` — the spring-like settle curve — is the correct easing for panel and content enters. Cards entering the viewport qualify as content settling into position.
- The `--card-index` custom property passed via inline style is a clean, CSS-native stagger mechanism with zero JavaScript overhead.
