---
title: Refactor AppSidebar and Shell Chrome
slug: part-001-refactor-sidebar
part_number: 1
status: in-progress
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-001-sidebar-header
estimated_duration: 4d
---

# Part-001: Refactor AppSidebar and Shell Chrome

## Objective

Make persistent navigation, header, and overlay chrome production-ready across every route.

## Scope

In scope:

- `AppSidebar`, sidebar items/sections, active project nav, search, collapse behavior.
- `AppHeader`, route context, utility actions, world-building pill nav, Nova model selector.
- Breadcrumb consistency and overlay shell treatment.
- Onboarding, toasts, AI panel, export/import, delete, and rewrite modal visual alignment where practical.

Out of scope:

- Route-family content redesigns.
- New navigation destinations.

## Implementation Steps

1. Stabilize sidebar dimensions and collapsed behavior using tokens.
2. Refactor active, hover, disabled, and locked nav states with color-independent cues.
3. Make header context responsive for long project names and route utility actions.
4. Align world-building pill nav with `GlassBar` or documented equivalent.
5. Migrate modal/drawer chrome to shared treatment where feasible.
6. Verify keyboard navigation and focus restore for overlays.
7. Capture before/after shell screenshots.

## Files

Update likely:

- `src/lib/components/AppSidebar.svelte`
- `src/lib/components/SidebarItem.svelte`
- `src/lib/components/SidebarSection.svelte`
- `src/lib/components/ActiveProjectSection.svelte`
- `src/lib/components/AppHeader.svelte`
- `src/lib/components/Breadcrumb.svelte`
- `src/lib/components/AiPanel.svelte`
- Shared modal/drawer components as needed.

## Acceptance Criteria

- [ ] Sidebar and header are visually cohesive and token-only.
- [ ] Collapsed sidebar remains usable and accessible.
- [ ] Header actions do not overlap route titles on mobile or desktop.
- [ ] Shell overlay components share visual treatment.
- [ ] Keyboard and focus behavior pass manual review.

## Edge Cases

- Long project titles must truncate without hiding utility actions.
- Long sidebar content must scroll inside the sidebar without stealing main content scroll.
