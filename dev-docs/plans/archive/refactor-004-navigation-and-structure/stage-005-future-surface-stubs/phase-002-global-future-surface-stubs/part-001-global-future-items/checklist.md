---
part: part-001-global-future-items
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] `AppSidebar.svelte` from Stage 001 reviewed; `SidebarItem` `locked` prop verified
- [ ] `part.md` reviewed and accepted

## Implementation

- [ ] `src/routes/nova/+page.ts` created — CSR-only
- [ ] `src/routes/nova/+page.svelte` created — Nova stub page
- [ ] `src/routes/images/+page.ts` created — CSR-only
- [ ] `src/routes/images/+page.svelte` created — Images stub page
- [ ] `src/routes/styles/+page.ts` created — CSR-only
- [ ] `src/routes/styles/+page.svelte` created — Styles stub page
- [ ] `AppSidebar.svelte` GLOBAL section updated with Nova, Images, Styles locked items
- [ ] `AppSidebar.svelte` RECENT section added with "Recent sessions" locked item
- [ ] RECENT section positioned after PROJECTS and before ACTIVE PROJECT
- [ ] All acceptance criteria in `part.md` satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact in `evidence/` (screenshot of updated sidebar + one stub page)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
