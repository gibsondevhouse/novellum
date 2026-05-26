---
title: Hub & Workspace Alignment
slug: stage-002-hub-and-workspace-alignment
stage_number: 2
status: complete
owner: Frontend Agent
plan: refactor-004-navigation-and-structure
phases:
  - phase-001-hub-surface-integration
  - phase-002-workspace-surface
estimated_duration: 2d
risk_level: medium
---

## Goal

Align the Hub with the new navigation architecture by moving it from `/projects/[id]/` to `/projects/[id]/hub` and adding a redirect from the old URL. Rename the Outline surface to Workspace at every level — route directory, module, components, and all imports. Document the data flow responsibilities of the Workspace surface.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Hub Surface Integration](phase-001-hub-surface-integration/phase.md) | `draft` | 0.75d |
| 002 | [Workspace Surface](phase-002-workspace-surface/phase.md) | `draft` | 1.25d |

## Entry Criteria

- Stage 001 complete: `AppSidebar` rendering in root layout with Active Project section
- Project layout header and `ProjectModeSwitcher` have been removed

## Exit Criteria

- Hub page renders at `/projects/[id]/hub`; redirect from `/projects/[id]/` is in place
- Outline route renamed to `/projects/[id]/workspace`; redirect from old route in place
- `src/modules/workspace/` module exists with correct barrel export
- All internal imports reference workspace module (not outliner directly from page files)
- Workspace and Hub sidebar items correctly reflect active state
- `pnpm run check` exits clean

## Notes

- The Hub route rename must account for SvelteKit's default child route: the `+page.svelte` at `/projects/[id]/` should redirect to `/hub`, not render content.
- The Outline → Workspace rename at route level intentionally frees `/projects/[id]/outline` for Stage 005's compiled output surface. This is by design.
- `src/modules/outliner/` is not renamed in this stage — a proxy `src/modules/workspace/index.ts` re-exports from it. Full module rename can be a future task.
