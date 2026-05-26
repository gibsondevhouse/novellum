---
title: Workspace Surface
slug: phase-002-workspace-surface
phase_number: 2
status: draft
owner: Frontend Agent
stage: stage-002-hub-and-workspace-alignment
parts:
  - part-001-outline-to-workspace-rename
  - part-002-workspace-sidebar-and-data-flow
estimated_duration: 1.25d
---

## Goal

Rename the Outline surface to Workspace at route, module, and import levels. Add a redirect from `/projects/[id]/outline` to `/projects/[id]/workspace`. Create a proxy module barrel (`src/modules/workspace/index.ts`) that re-exports from the existing outliner module. Document Workspace data flow responsibilities.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Outline to Workspace Rename](part-001-outline-to-workspace-rename/part.md) | `draft` | Frontend Agent | 1d |
| 002 | [Workspace Sidebar & Data Flow](part-002-workspace-sidebar-and-data-flow/part.md) | `draft` | Frontend Agent | 0.25d |

## Acceptance Criteria

- [ ] Route directory `src/routes/projects/[id]/workspace/` exists with `+page.svelte` and `+page.ts`
- [ ] Route `src/routes/projects/[id]/outline/` redirects to `/workspace` via `+page.ts`
- [ ] `src/modules/workspace/index.ts` exists and re-exports all public API from `src/modules/outliner/`
- [ ] Workspace page imports from `src/modules/workspace` (or keeps direct outliner imports — both acceptable during transition)
- [ ] Workspace sidebar item shows active state when pathname starts with `/projects/[id]/workspace`
- [ ] `pnpm run check` exits clean; no dead imports

## Notes

- The old `/projects/[id]/outline` redirect must survive Stage 005, when that URL is re-used for the compiled output surface. In Stage 005, the redirect is removed and a real page is created. Coordinate to avoid conflicts.
- Page line limit: Workspace `+page.svelte` must stay ≤150 lines. If the current Outline page exceeds this, split into sub-components before copying.
