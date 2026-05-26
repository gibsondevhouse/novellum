---
part: part-001-sidebar-component-primitives
last_updated: 2026-04-13
---

# Implementation Checklist

## Pre-Implementation

- [ ] Parent phase and stage are `in-progress`
- [ ] All declared dependencies are `complete`
- [ ] `part.md` has been reviewed and accepted
- [ ] Dev environment is ready (`pnpm run dev` starts without errors)

## Implementation

- [ ] `SidebarItem.svelte` created with `href`, `label`, `icon`, `active`, `locked` props
- [ ] `SidebarItem` renders `<a>` when not locked, `<span>` when locked
- [ ] `SidebarItem` active state uses `startsWith` matching (exact match for `/`)
- [ ] `SidebarSection.svelte` created with optional `label` and `children` snippet
- [ ] `AppSidebar.svelte` shell created with `<aside>` wrapper using `--sidebar-width` token
- [ ] `src/lib/components/index.ts` exports all three new components
- [ ] All styles use CSS custom property tokens — no hardcoded values
- [ ] All acceptance criteria in `part.md` are satisfied

## Post-Implementation

- [ ] `pnpm run lint` passes with zero errors
- [ ] `pnpm run check` passes with zero errors
- [ ] At least one artifact added to `evidence/` (e.g., screenshot of sidebar shell rendering)
- [ ] `impl.log.md` updated with final entry
- [ ] Part `status` updated to `review` in `part.md` frontmatter
- [ ] Reviewer notified / Reviewer Agent invoked
