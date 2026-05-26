---
title: Root Layout Sidebar Swap
slug: part-001-root-layout-sidebar-swap
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-003-root-layout-and-routing-integration
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

Swap `<Sidebar />` for `<AppSidebar />` in the root layout. Delete `Sidebar.svelte`. Update the component barrel export. After this part, the full new sidebar system is live in the application.

## Context

- `src/routes/+layout.svelte` renders `<Sidebar />` (a minimal single-link nav) as the global sidebar
- `AppSidebar.svelte` with GLOBAL, PROJECTS, and ACTIVE PROJECT sections was built in Phase 001
- `Sidebar.svelte` is exported from `src/lib/components/index.ts` as the old export
- Once swapped, every page will use the new sidebar — verify visually before deleting old file

## Scope

**In scope:**

- Update `src/routes/+layout.svelte`: replace `<Sidebar />` with `<AppSidebar />`
- Delete `src/lib/components/Sidebar.svelte`
- Update `src/lib/components/index.ts`: remove old `Sidebar` export; ensure all four new exports present

**Out of scope:**

- Any layout restructure beyond the component swap
- Active-state store changes — Part 002

## Implementation Steps

1. Update `src/routes/+layout.svelte`:
   - Replace `import { Sidebar } from '$lib/components'` with `import { AppSidebar } from '$lib/components'` (or adjust import style to match existing)
   - Replace `<Sidebar />` with `<AppSidebar />`
   - Verify layout structure is still `display: flex; flex-direction: row` with sidebar + `<main class="main-content">`
   - Verify `--sidebar-width` token is still used for `main-content` left offset or margin

2. Open browser and confirm `AppSidebar` renders with all sections. Only then proceed to deletion.

3. Delete `src/lib/components/Sidebar.svelte`

4. Update `src/lib/components/index.ts`:
   - Remove: `export { default as Sidebar } from './Sidebar.svelte'`
   - Confirm these four exports are present:
     - `export { default as AppSidebar } from './AppSidebar.svelte'`
     - `export { default as SidebarSection } from './SidebarSection.svelte'`
     - `export { default as SidebarItem } from './SidebarItem.svelte'`
     - `export { default as ActiveProjectSection } from './ActiveProjectSection.svelte'`

5. Run `grep -r "from.*Sidebar" src/` to find any remaining `Sidebar` import references and remove them

## Files

**Update:**

- `src/routes/+layout.svelte` — swap sidebar component
- `src/lib/components/index.ts` — update exports

**Delete:**

- `src/lib/components/Sidebar.svelte`

## Acceptance Criteria

- [ ] `src/routes/+layout.svelte` renders `<AppSidebar />` — no `<Sidebar />` reference remains
- [ ] `Sidebar.svelte` deleted; no file at `src/lib/components/Sidebar.svelte`
- [ ] `index.ts` exports `AppSidebar`, `SidebarSection`, `SidebarItem`, `ActiveProjectSection`; no `Sidebar` or `ProjectModeSwitcher`
- [ ] Root layout still renders correct flex structure (sidebar + main content)
- [ ] `pnpm run check` exits clean

## Edge Cases

- If any page file imports `Sidebar` directly (not via index), find and remove those imports
- The `main-content` flex child may have a `margin-left` or `padding-left` that references `--sidebar-width` — preserve this; it ensures main content is not hidden behind the sidebar

## Notes

- Delete `Sidebar.svelte` only after visually confirming `AppSidebar` renders — do not delete speculatively
