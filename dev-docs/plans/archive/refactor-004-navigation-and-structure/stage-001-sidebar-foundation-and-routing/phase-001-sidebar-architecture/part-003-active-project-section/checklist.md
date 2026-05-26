---
part: part-003-active-project-section
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] `part-002-global-and-projects-sections` is `complete`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready

## Implementation

- [ ] `ActiveProjectSection.svelte` created
- [ ] Section renders `{#if base}` — hidden on non-project routes
- [ ] All five project nav items present: Hub, Workspace, World Building, Continuity, Outline (locked)
- [ ] Active state uses `startsWith` matching for all items
- [ ] Outline item has `locked={true}` and is non-interactive
- [ ] `AppSidebar.svelte` updated to render `<ActiveProjectSection />`
- [ ] `index.ts` updated with `ActiveProjectSection` export
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact added to `evidence/` (screenshot showing Active Project section on a project route vs hidden on home)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
