---
part: part-001-hover-lift
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] `--shadow-xs`, `--shadow-md`, `--ease-standard`, `--duration-fast` confirmed in `tokens.css`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] `.project-card` resting border and shadow tokens applied
- [ ] Transition shorthand set (no `transition: all` conflict)
- [ ] `.project-card:hover` updated with strong border + elevated shadow
- [ ] Old teal hover rule removed

## Post-Implementation

- [ ] Lint passes with zero errors (`pnpm run lint`)
- [ ] Type-check passes with zero errors (`pnpm run check`)
- [ ] At least one artifact added to `evidence/`
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
