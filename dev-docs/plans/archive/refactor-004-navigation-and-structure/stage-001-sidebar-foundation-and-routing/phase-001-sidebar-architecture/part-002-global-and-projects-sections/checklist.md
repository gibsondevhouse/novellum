---
part: part-002-global-and-projects-sections
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] `part-001-sidebar-component-primitives` is `complete`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] GLOBAL section (no label) added to `AppSidebar.svelte`
- [ ] Home item renders with exact-path active logic
- [ ] Nova, Images, Styles items render as locked
- [ ] PROJECTS section added with "PROJECTS" label
- [ ] Books item renders as active link; Stories as locked
- [ ] Inline SVG icons present for all items
- [ ] Visual separator between GLOBAL and PROJECTS sections
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact added to `evidence/` (screenshot of sidebar with both sections)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
