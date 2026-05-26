---
title: Global Shell and Persistent Chrome
slug: stage-003-global-shell
stage_number: 3
status: in-progress
owner: Architect / Stylist
plan: plan-015-cinematic-media
phases:
  - phase-001-sidebar-header
estimated_duration: 4d
risk_level: high
---

# Stage-003: Global Shell and Persistent Chrome

## Goal

Make the application frame production-ready before route-family refactors begin. The sidebar, header, contextual navigation, overlays, onboarding, toasts, AI panel, and modal/drawer chrome must feel like one stable cinematic shell.

## Entry Criteria

- Stage 002 primitives are available.
- Token violations are cleared.
- Existing shell behavior has baseline screenshots from Stage 001.

## Phases

| # | Phase | Status | Owner | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Sidebar and Header](phase-001-sidebar-header/phase-001-sidebar-header.md) | `in-progress` | Architect / Stylist | 4d |

## Required Deliverables

- Refactored `AppSidebar`, `SidebarItem`, `SidebarSection`, `ActiveProjectSection`, and collapsed/mobile states.
- Refactored `AppHeader`, route context, utility actions, world-building navigation, and model selector placement.
- Shared modal/drawer treatment for onboarding, export/import, delete confirmation, rewrite options, and AI panel behavior.
- Consistent breadcrumbs and project context navigation.

## Exit Criteria

- Shell screenshots pass desktop, mobile, and wide-desktop review.
- Keyboard navigation can enter, traverse, and leave shell controls without trap or focus loss.
- Persistent chrome does not overlap content or hide primary route actions.
- Shell changes do not introduce layout jumps in app-level or project-level routes.

## Notes

Shell work affects every route screenshot. Stabilize this stage before updating route visual baselines.
