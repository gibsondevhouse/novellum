---
title: SvelteKit App Shell
slug: phase-001-sveltekit-app-shell
phase_number: 1
status: complete
owner: Frontend Agent
stage: stage-002-application-shell
parts:
  - part-001-root-layout-and-routing
  - part-002-sidebar-navigation-component
estimated_duration: 2d
---

## Goal

Implement the root SvelteKit layout, configure the file-based route tree for all module pages, and build the `Sidebar` navigation component that persists across every route.

## Parts

| #   | Part                                                                          | Status  | Assigned To    | Est. Duration |
| --- | ----------------------------------------------------------------------------- | ------- | -------------- | ------------- |
| 001 | [Root Layout & Routing](part-001-root-layout-and-routing/part.md)             | `draft` | Frontend Agent | 1d            |
| 002 | [Sidebar Navigation Component](part-002-sidebar-navigation-component/part.md) | `draft` | Frontend Agent | 1d            |

## Acceptance Criteria

- [ ] `src/routes/+layout.svelte` renders a two-column shell (sidebar + `<slot />`)
- [ ] Routes exist for `/`, `/projects/[id]`, `/projects/[id]/bible`, `/projects/[id]/outline`, `/projects/[id]/editor`
- [ ] `Sidebar.svelte` renders nav links to all four module routes and highlights the active route
- [ ] Navigating between routes does not cause a full page reload (SvelteKit client-side routing confirmed)
- [ ] `pnpm run check` and `pnpm run lint` pass
