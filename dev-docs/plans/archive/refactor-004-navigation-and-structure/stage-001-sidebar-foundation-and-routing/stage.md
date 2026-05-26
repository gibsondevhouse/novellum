---
title: Sidebar Foundation, Header Removal & Routing
slug: stage-001-sidebar-foundation-and-routing
stage_number: 1
status: complete
owner: Frontend Agent
plan: refactor-004-navigation-and-structure
phases:
  - phase-001-sidebar-architecture
  - phase-002-header-removal-and-action-migration
  - phase-003-root-layout-and-routing-integration
estimated_duration: 3d
risk_level: high
---

## Goal

Build the new sidebar system from scratch with all sections (Global, Projects, Active Project, Recent stubs). Remove the project layout header and `ProjectModeSwitcher`. Wire the root layout to use the new sidebar. Establish the URL routing convention that all project surfaces depend on.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Sidebar Architecture](phase-001-sidebar-architecture/phase.md) | `draft` | 1.5d |
| 002 | [Header Removal & Action Migration](phase-002-header-removal-and-action-migration/phase.md) | `draft` | 1d |
| 003 | [Root Layout & Routing Integration](phase-003-root-layout-and-routing-integration/phase.md) | `draft` | 0.5d |

## Entry Criteria

- `refactor-003-hub-story-identity` is complete
- `src/lib/components/Sidebar.svelte` and `ProjectModeSwitcher.svelte` exist and are understood
- `src/routes/+layout.svelte` renders `<Sidebar />` as the global nav
- `src/routes/projects/[id]/+layout.svelte` renders `.project-header` and `<ProjectModeSwitcher />`

## Exit Criteria

- `AppSidebar` renders in root layout with all four sections: GLOBAL, PROJECTS, ACTIVE PROJECT, RECENT
- Project layout no longer renders a `<header>` element or `<ProjectModeSwitcher>`
- All project surfaces remain accessible via sidebar navigation
- `pnpm run lint` and `pnpm run check` pass with zero errors
- No old `Sidebar.svelte` or `ProjectModeSwitcher.svelte` files remain

## Notes

- Create `AppSidebar.svelte` as a new file alongside the old `Sidebar.svelte`; do not modify the existing file. Swap in root layout only after the new sidebar renders correctly; then delete `Sidebar.svelte`.
- `ProjectModeSwitcher.svelte` is deleted entirely — it is not adapted or preserved.
- This is the highest-risk stage: routing changes and layout restructuring affect every project surface. Proceed phase by phase, verifying each before starting the next.
