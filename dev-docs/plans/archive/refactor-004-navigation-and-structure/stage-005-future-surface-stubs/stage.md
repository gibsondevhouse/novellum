---
title: Future Surface Stubs
slug: stage-005-future-surface-stubs
stage_number: 5
status: complete
owner: Frontend Agent
plan: refactor-004-navigation-and-structure
phases:
  - phase-001-compiled-outline-stub
  - phase-002-global-future-surface-stubs
estimated_duration: 1d
risk_level: low
---

## Goal

Register all planned-but-not-yet-implemented surfaces in the sidebar with locked states. Create minimal route stubs for the compiled Outline, Nova, Images, and Styles. Stub the Recent section. This completes the navigation architecture: every future surface has a registered entry point and a clear integration target.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Compiled Outline Stub](phase-001-compiled-outline-stub/phase.md) | `draft` | 0.5d |
| 002 | [Global Future Surface Stubs](phase-002-global-future-surface-stubs/phase.md) | `draft` | 0.5d |

## Entry Criteria

- Stages 001–004 complete
- `/projects/[id]/outline` route is free (previously renamed to `/workspace` in Stage 002); no redirect from outline to workspace should conflict with the new outline stub

## Exit Criteria

- Route `/projects/[id]/outline` serves the compiled outline stub page
- Routes `/nova`, `/images`, `/styles` serve stub pages
- All four surfaces appear as locked items in the sidebar (ACTIVE PROJECT: Outline; GLOBAL: Nova, Images, Styles)
- RECENT sidebar section renders as a stub
- Locked `SidebarItem` elements are non-interactive, visually distinct (reduced opacity, lock icon)
- `pnpm run check` exits clean

## Notes

- "Locked" is a `SidebarItem` prop (`locked?: boolean`). When `true`, the item renders as a non-interactive `<span>` with an icon and reduced opacity. No navigation occurs on click.
- Stub pages contain only a minimal layout: surface name, one-sentence description, and a "Coming soon" badge. No business logic.
- The compiled Outline surface is intentionally minimal here — its data source (Workspace act/chapter/scene hierarchy) and rendering logic are a future plan.
