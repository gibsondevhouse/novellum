---
title: Sidebar Projects Link & Column Swap
slug: stage-001-sidebar-projects-link
status: draft
assignee: architect
parts:
  - part-001-sidebar-nav-link
  - part-002-column-swap
---

## Objective

Restore the "Projects" link in the sidebar primary navigation and swap the column order on the projects page.

## Parts

| #   | Part                          | Status  | Agent     |
| --- | ----------------------------- | ------- | --------- |
| 001 | Add Projects sidebar nav link | `draft` | architect |
| 002 | Swap projects page columns    | `draft` | architect |

## Acceptance Criteria

- [ ] Sidebar primary nav section includes a "Projects" item linking to `/projects` with a folder/grid icon.
- [ ] "Projects" sidebar item is highlighted when the route is exactly `/projects`.
- [ ] `/projects` page renders **Stories column on the left**, **Books column on the right**.
- [ ] `pnpm run lint` passes (boundaries check).
- [ ] `pnpm run check` passes (typecheck).
- [ ] `pnpm run test` passes.

## Implementation Notes

### Part 001: Sidebar Nav Link

**File:** `src/lib/components/AppSidebar.svelte`

1. Add derived state:
   ```ts
   let isProjectsActive = $derived(page.url.pathname === '/projects');
   ```

2. Add `SidebarItem` in the primary `<SidebarSection>` (after "Styles" or wherever appropriate):
   ```svelte
   <SidebarItem href="/projects" label="Projects" active={isProjectsActive}>
     {#snippet icon()}
       <!-- Use a grid/folder icon -->
       <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
         <rect x="3" y="3" width="7" height="7"></rect>
         <rect x="14" y="3" width="7" height="7"></rect>
         <rect x="14" y="14" width="7" height="7"></rect>
         <rect x="3" y="14" width="7" height="7"></rect>
       </svg>
     {/snippet}
   </SidebarItem>
   ```

### Part 002: Column Swap

**File:** `src/routes/projects/+page.svelte`

Swap the two `<div class="projects-column">` blocks in the template so the **Stories column** (`{#each stories ...}`) appears first (left) and the **Books column** (`{#each books ...}`) appears second (right).

No CSS changes needed — the existing `grid-template-columns: 1fr 1fr` handles the layout.
