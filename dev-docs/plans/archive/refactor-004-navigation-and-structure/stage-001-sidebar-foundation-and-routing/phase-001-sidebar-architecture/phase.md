---
title: Sidebar Architecture
slug: phase-001-sidebar-architecture
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-001-sidebar-foundation-and-routing
parts:
  - part-001-sidebar-component-primitives
  - part-002-global-and-projects-sections
  - part-003-active-project-section
estimated_duration: 1.5d
---

## Goal

Build the three-layer sidebar component system: foundational primitives (`AppSidebar`, `SidebarSection`, `SidebarItem`), static sections (GLOBAL + PROJECTS), and the dynamic Active Project section that reads project context from the route.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Sidebar Component Primitives](part-001-sidebar-component-primitives/part.md) | `draft` | Frontend Agent | 0.75d |
| 002 | [Global & Projects Sections](part-002-global-and-projects-sections/part.md) | `draft` | Frontend Agent | 0.25d |
| 003 | [Active Project Section](part-003-active-project-section/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] `AppSidebar.svelte`, `SidebarSection.svelte`, `SidebarItem.svelte`, and `ActiveProjectSection.svelte` created in `src/lib/components/`
- [ ] GLOBAL section renders: Home active link, Nova / Images / Styles as locked stubs
- [ ] PROJECTS section renders: Books nav item linking to project list
- [ ] ACTIVE PROJECT section renders project-specific nav items when `$page.params.id` is defined
- [ ] ACTIVE PROJECT section renders nothing (hidden or height:0) when not on a project route
- [ ] `SidebarItem` supports `locked` prop — locked items are non-interactive and visually distinct
- [ ] Active state for multi-segment routes uses `startsWith` matching, not exact path equality
- [ ] All components use CSS custom properties from `tokens.css` exclusively
- [ ] `pnpm run check` exits clean

## Notes

- All four components live in `src/lib/components/` (shared lib level) — they are global to the app, not module-scoped
- `SidebarItem` auto-derives active state from `$page.url.pathname` when not explicitly passed via prop
- The existing `Sidebar.svelte` is not modified in this phase — `AppSidebar.svelte` is built alongside it
