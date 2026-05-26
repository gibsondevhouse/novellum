---
title: Hub Surface Integration
slug: phase-001-hub-surface-integration
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-002-hub-and-workspace-alignment
parts:
  - part-001-hub-sidebar-alignment
estimated_duration: 0.75d
---

## Goal

Move the Hub route from `/projects/[id]/` to `/projects/[id]/hub`. Add a redirect from the old root route. Ensure the Hub page operates correctly without the removed project layout header — including surfacing the edit, export, and delete actions that migrated here from the header.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Hub Sidebar Alignment](part-001-hub-sidebar-alignment/part.md) | `draft` | Frontend Agent | 0.75d |

## Acceptance Criteria

- [ ] Route `src/routes/projects/[id]/hub/` exists and renders the Hub page
- [ ] `src/routes/projects/[id]/+page.ts` redirects to `/projects/[id]/hub` (307 redirect)
- [ ] Hub sidebar item shows active state when pathname starts with `/projects/[id]/hub`
- [ ] Hub page includes project utility actions (edit, export, delete) without relying on removed header
- [ ] `pnpm run check` exits clean

## Notes

- The Hub page inherits the `ProjectHubHero`, `StructuralMetricsCarousel`, and all components from `refactor-003-hub-story-identity` — these components remain unchanged; only the route and action placement change
- Routing: SvelteKit `redirect(307, ...)` in the load function of `+page.ts` at the project root is the cleanest approach
