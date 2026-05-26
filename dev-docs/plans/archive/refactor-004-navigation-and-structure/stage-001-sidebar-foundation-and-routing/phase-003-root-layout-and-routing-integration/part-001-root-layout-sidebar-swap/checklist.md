---
part: part-001-root-layout-sidebar-swap
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] Phase 001 and Phase 002 complete
- [ ] `AppSidebar.svelte` renders correctly in isolation (verified in Phase 001 parts)
- [ ] `part.md` reviewed and accepted
- [ ] Dev environment ready

## Implementation

- [ ] `+layout.svelte` updated to use `<AppSidebar />`
- [ ] `Sidebar.svelte` deleted after visual confirmation
- [ ] `index.ts` updated: old exports removed, four new exports confirmed
- [ ] Grep confirms no remaining `Sidebar` import references in `src/`
- [ ] Root layout flex structure preserved
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact in `evidence/` (screenshot of full app with new sidebar visible)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
