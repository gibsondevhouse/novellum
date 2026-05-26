---
title: Active Project Section
slug: part-003-active-project-section
part_number: 3
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-sidebar-architecture
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `ActiveProjectSection.svelte` — a dynamic sidebar section that reads the current project ID from `$page.params.id` and renders project-specific nav items when on a project route. When not on a project route, the section renders nothing. Import and use it within `AppSidebar.svelte` between the PROJECTS and RECENT sections.

## Context

- SvelteKit `$page` store (from `$app/stores`) provides reactive access to `$page.params`
- `$page.params.id` is defined on any route under `/projects/[id]/` and undefined elsewhere
- Project surface routes after this refactor: `/hub`, `/workspace`, `/world-building`, `/continuity`, `/outline` (locked)
- The Active Project section must use `startsWith` matching for active state (e.g., Workspace is active on `/projects/[id]/workspace` and any sub-routes)

## Scope

**In scope:**

- Create `src/lib/components/ActiveProjectSection.svelte`
- Render items: Hub, Workspace, World Building, Continuity, Outline (locked)
- Update `AppSidebar.svelte` to import and render `ActiveProjectSection`
- Update `src/lib/components/index.ts` to export `ActiveProjectSection`

**Out of scope:**

- Actual route implementation for the surfaces (done in Stages 002–005)
- Recent section — Stage 005 Part 002
- Project switcher UI — future plan

## Implementation Steps

1. Create `src/lib/components/ActiveProjectSection.svelte` (Svelte 5):

   ```ts
   import { page } from '$app/stores';
   import SidebarSection from './SidebarSection.svelte';
   import SidebarItem from './SidebarItem.svelte';

   const id = $derived($page.params.id);
   const base = $derived(id ? `/projects/${id}` : null);
   ```

   - Wrap entire render in `{#if base}` — section only renders on project routes
   - `<SidebarSection label="ACTIVE PROJECT">` containing:
     - Hub: `href="{base}/hub"`, label "Hub", hub/grid icon
     - Workspace: `href="{base}/workspace"`, label "Workspace", layers icon
     - World Building: `href="{base}/world-building"`, label "World Building", globe/earth icon
     - Continuity: `href="{base}/continuity"`, label "Continuity", link-chain icon
     - Outline: `href="{base}/outline"`, label "Outline", `locked={true}`, document icon
   - Add a visual separator above the section (`<hr class="sidebar-divider">`) for visual grouping

2. Update `AppSidebar.svelte`:
   - Import `ActiveProjectSection`
   - Render `<ActiveProjectSection />` after the PROJECTS section and separator

3. Update `src/lib/components/index.ts`:
   - Add: `export { default as ActiveProjectSection } from './ActiveProjectSection.svelte'`

## Files

**Create:**

- `src/lib/components/ActiveProjectSection.svelte`

**Update:**

- `src/lib/components/AppSidebar.svelte` — import and render `ActiveProjectSection`
- `src/lib/components/index.ts` — add `ActiveProjectSection` export

## Acceptance Criteria

- [ ] `ActiveProjectSection` renders all five project nav items when `$page.params.id` is defined
- [ ] `ActiveProjectSection` renders nothing when `$page.params.id` is undefined (non-project routes)
- [ ] Active state uses `startsWith` matching — each item is active on its surface route and all sub-routes
- [ ] Outline item renders as locked (`locked={true}`) — non-interactive
- [ ] Visual separator rendered above the section for visual grouping
- [ ] `pnpm run check` exits clean

## Edge Cases

- If project routes do not yet exist (Stage 002–005 pending), the Hub/Workspace/etc. links will 404 — this is acceptable at this stage; the section still renders correctly
- `$page.params.id` is a string; verify it is not the literal string `"undefined"` before deriving `base`

## Notes

- Use `$derived` not `$effect` for deriving `id` and `base` from the page store
- `ActiveProjectSection` must be ≤80 lines — inline icons as snippets or external icon constants if needed to stay lean
