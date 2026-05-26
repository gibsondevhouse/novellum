---
title: Compiled Outline Stub
slug: phase-001-compiled-outline-stub
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-005-future-surface-stubs
parts:
  - part-001-compiled-outline-route-stub
estimated_duration: 0.5d
---

## Goal

Claim the `/projects/[id]/outline` URL (freed by the Workspace rename in Stage 002) as the compiled structural output surface. Create a minimal stub route page. The Outline sidebar item in Active Project section must render as locked.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Compiled Outline Route Stub](part-001-compiled-outline-route-stub/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] Route `src/routes/projects/[id]/outline/+page.svelte` exists and renders a "Coming Soon" surface
- [ ] Page clearly identifies the surface: "Outline — Compiled structural output from Workspace"
- [ ] Stage 002's redirect (outline → workspace) is removed; the route now serves the stub directly
- [ ] Outline sidebar item in `ActiveProjectSection` uses `locked={true}` and is non-interactive
- [ ] `pnpm run check` exits clean

## Notes

- The Stage 002 redirect file (`src/routes/projects/[id]/outline/+page.ts` with `redirect`) must be replaced by real page files in this part
- No business logic in the stub — a centered layout with surface description and a lock icon is sufficient
