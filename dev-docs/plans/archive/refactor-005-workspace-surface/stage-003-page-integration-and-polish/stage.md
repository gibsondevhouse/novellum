---
title: Page Integration & Polish
slug: stage-003-page-integration-and-polish
stage_number: 3
status: draft
owner: Planner Agent
plan: refactor-005-workspace-surface
phases:
  - phase-001-route-rewrite
  - phase-002-visual-polish-and-scroll
estimated_duration: 1d
risk_level: low
---

## Goal

> Wire all new components into the Workspace route, rewrite the data loader and page template, establish the fixed-hero / scrolling-collection layout, and align the visual treatment with the Hub's cinematic aesthetic.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Route Rewrite](phase-001-route-rewrite/phase.md) | `draft` | 0.5d |
| 002 | [Visual Polish & Scroll](phase-002-visual-polish-and-scroll/phase.md) | `draft` | 0.5d |

## Entry Criteria

> What must be true before this stage can begin.

- Stage 002 (Component Architecture) is `complete`
- All hero zone and collection zone components are functional and tested

## Exit Criteria

> What must be true for this stage to be marked `complete`.

- All phases complete
- Workspace `+page.ts` loads arcs, acts, chapters, scenes for the project
- Workspace `+page.svelte` renders hero zone + collection zone
- Hero zone remains fixed while collection zone scrolls independently
- No visible scrollbar on collection zone
- Visual language matches Hub: card chrome, spacing, typography, color
- Empty states feel intentional and polished
- Mode cycling (left/right arrows) works correctly
- Lower section updates according to active hero mode
- All quality gates passed (lint, typecheck, tests)

## Notes

> The existing `+page.svelte` is fully replaced. The old split-panel layout (HierarchyNavigator + detail card) is retired from the route. The outliner module components continue to exist for potential future use but are no longer imported by the workspace route.
>
> The migration function (`migrateOutlineToStoryWorkspace`) should still run on mount to ensure data consistency.
