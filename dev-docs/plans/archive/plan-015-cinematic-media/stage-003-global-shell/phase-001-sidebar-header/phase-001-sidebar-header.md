---
title: Sidebar and Header
slug: phase-001-sidebar-header
phase_number: 1
status: in-progress
owner: Architect / Stylist
stage: stage-003-global-shell
parts:
  - part-001-refactor-sidebar
estimated_duration: 4d
---

# Phase-001: Sidebar and Header

## Goal

Refactor persistent shell chrome into a stable production frame that supports every route family.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Refactor AppSidebar and Shell Chrome](part-001-refactor-sidebar.md) | `in-progress` | Architect / Stylist | 4d |

## Implementation Strategy

Use Stage 002 primitives where possible and keep persistent shell layout stable. Update sidebar, header, active project navigation, contextual navigation, breadcrumbs, and overlay chrome together so route families do not need local header/sidebar workarounds.

## Acceptance Criteria

- [ ] Sidebar collapsed/expanded states are stable and keyboard accessible.
- [ ] Header utility actions, project context, world-building pill nav, and model selector remain readable at responsive widths.
- [ ] Overlays, modals, and drawers use consistent shell treatment and restore focus.
- [ ] App-level and project-level routes still scroll correctly inside the root layout.

## Edge Cases

- Long project names and nav labels must truncate gracefully without hiding icons or actions.
- Sidebar overflow must not trap scroll away from the main content.
