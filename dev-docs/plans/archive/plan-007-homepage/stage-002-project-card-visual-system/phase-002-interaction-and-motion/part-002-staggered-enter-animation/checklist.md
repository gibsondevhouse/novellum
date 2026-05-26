---
part: part-002-staggered-enter-animation
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] Part 001 (hover lift) is `complete`
- [ ] `novellum-enter` keyframe location confirmed (or ready to add to `app.css`)
- [ ] `--duration-enter`, `--ease-editorial` confirmed in `tokens.css`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] `{#each}` updated with loop index `i`; `style="--card-index: {i}"` passed to each `<ProjectCard>`
- [ ] `.project-card` animation and delay declared
- [ ] Reduced-motion override added
- [ ] `@keyframes novellum-enter` confirmed present or added to `app.css`

## Post-Implementation

- [ ] Lint passes with zero errors (`pnpm run lint`)
- [ ] Type-check passes with zero errors (`pnpm run check`)
- [ ] At least one artifact added to `evidence/` (screen recording or description of stagger observed in browser)
- [ ] Reduced-motion behaviour verified (DevTools → Rendering → Emulate media: prefers-reduced-motion)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
