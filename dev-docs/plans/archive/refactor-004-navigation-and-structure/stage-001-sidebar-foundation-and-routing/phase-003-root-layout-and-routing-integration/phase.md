---
title: Root Layout & Routing Integration
slug: phase-003-root-layout-and-routing-integration
phase_number: 3
status: draft
owner: Frontend Agent
stage: stage-001-sidebar-foundation-and-routing
parts:
  - part-001-root-layout-sidebar-swap
  - part-002-routing-and-active-state-strategy
estimated_duration: 0.5d
---

## Goal

Swap the root layout from `<Sidebar />` to `<AppSidebar />`. Delete `Sidebar.svelte`. Update the `index.ts` barrel. Verify and harden the `active-project.svelte.ts` store so projectId is always derived reactively from the page URL — no stale state on navigation.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Root Layout Sidebar Swap](part-001-root-layout-sidebar-swap/part.md) | `draft` | Frontend Agent | 0.25d |
| 002 | [Routing & Active State Strategy](part-002-routing-and-active-state-strategy/part.md) | `draft` | Frontend Agent | 0.25d |

## Acceptance Criteria

- [ ] `src/routes/+layout.svelte` imports and renders `<AppSidebar />` (not `<Sidebar />`)
- [ ] `Sidebar.svelte` deleted from `src/lib/components/`
- [ ] `src/lib/components/index.ts` exports `AppSidebar`, `SidebarSection`, `SidebarItem`, `ActiveProjectSection`; no longer exports `Sidebar` or `ProjectModeSwitcher`
- [ ] `active-project.svelte.ts` correctly reflects `projectId` from `$page.params.id` on every navigation event
- [ ] URL routing scheme documented (table in architecture or frontend context doc)
- [ ] `pnpm run check` exits clean; `pnpm run lint` zero errors

## Notes

- Delete `Sidebar.svelte` only after `AppSidebar` renders visually in the browser — do not delete before confirming
- The `active-project.svelte.ts` may currently depend on a manual setter called during route load; replace this pattern with reactive derivation from `$page` to avoid stale-state bugs
