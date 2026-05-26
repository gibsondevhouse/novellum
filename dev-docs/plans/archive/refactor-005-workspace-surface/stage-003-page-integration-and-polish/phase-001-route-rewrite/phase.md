---
title: Route Rewrite
slug: phase-001-route-rewrite
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-003-page-integration-and-polish
parts:
  - part-001-workspace-page-rewrite
estimated_duration: 0.5d
---

## Goal

> Rewrite the Workspace `+page.ts` data loader and `+page.svelte` template to use the new component architecture — loading all four entity types, initializing the mode store, and composing the hero zone and collection zone into the two-zone vertical layout.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Workspace Page Rewrite](part-001-workspace-page-rewrite/part.md) | `draft` | frontend | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] `+page.ts` loads arcs, acts, chapters (with scenes), and characters for the project
- [ ] `+page.svelte` composes `WorkspaceHeroShell` + `WorkspaceCollectionPane`
- [ ] Mode state is initialized and drives both hero and collection rendering
- [ ] Migration (`migrateOutlineToStoryWorkspace`) still runs on mount
- [ ] All data flows correctly from loader → store → components
- [ ] Old split-panel imports (HierarchyNavigator, OutlineDetailCard, ActPlanningPanel) are removed from the route

## Notes

> The `+page.ts` loader adds arcs and characters to its return payload. Characters are needed for Scene hero POV display. The existing `storyFrame`, `acts`, and `chapters` (with scenes) remain in the payload.
