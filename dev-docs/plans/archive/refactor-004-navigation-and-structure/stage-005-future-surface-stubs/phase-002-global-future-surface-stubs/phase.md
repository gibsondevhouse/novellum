---
title: Global Future Surface Stubs
slug: phase-002-global-future-surface-stubs
phase_number: 2
status: draft
owner: Frontend Agent
stage: stage-005-future-surface-stubs
parts:
  - part-001-global-future-items
estimated_duration: 0.5d
---

## Goal

Create route stubs and sidebar entries for the three global future surfaces: Nova, Images, Styles. Add the RECENT section stub to the sidebar. All are locked and non-interactive — they communicate intent without offering functionality.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Global Future Items](part-001-global-future-items/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] Routes `/nova`, `/images`, `/styles` each have `+page.svelte` with a "Coming Soon" layout
- [ ] `+page.ts` exists for each stub (CSR-only export; `export const ssr = false`)
- [ ] `AppSidebar` GLOBAL section renders Nova, Images, Styles as `locked={true}` sidebar items
- [ ] RECENT section stub rendered in `AppSidebar` with label "RECENT" and a "Coming soon" placeholder item
- [ ] Locked items have reduced opacity and a lock or "•" indicator; click produces no navigation
- [ ] `pnpm run check` exits clean

## Notes

- The stub pages under `/nova`, `/images`, `/styles` are at the root of the app (not under `/projects/[id]/`) — they are global surfaces, not project-scoped
- RECENT section: just a `SidebarSection` with label "RECENT" and a single non-interactive `SidebarItem` label "Recent sessions" with `locked={true}` — no functional implementation
