---
part: part-002-routing-and-active-state-strategy
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] `part-001-root-layout-sidebar-swap` is `complete`
- [ ] `active-project.svelte.ts` current implementation reviewed
- [ ] `part.md` reviewed and accepted

## Implementation

- [ ] `active-project.svelte.ts` updated to derive projectId reactively from `$page.params.id`
- [ ] Manual setter calls removed from layout load functions (if they existed)
- [ ] Navigation between projects updates store without stale state
- [ ] URL scheme table documented in frontend context doc
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact in `evidence/` (test output or screenshot showing active state changing on navigation)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
