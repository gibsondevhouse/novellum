---
title: Upgrade Outline Navigator to Seven Layers
slug: part-001-upgrade-outline-navigator-to-seven-layers
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-002-seven-layer-navigator-upgrade
started_at: 2026-05-26T16:15:16Z
completed_at: 2026-05-26T16:32:06Z
estimated_duration: 2d
---

## Objective

Deliver a production seven-layer navigator (Arc, Act, Milestone, Chapter, Scene, Beat, Stage) with scoped child lists, breadcrumb path, and layer-specific empty states.

## Scope

**In scope:**

- Extend existing outline navigator UI to render seven scoped layers.
- Add clickable breadcrumb segments that clear descendants.
- Add per-layer empty-state messaging and next action hints.

**Out of scope:**

- Stage orchestration execution controls.
- Checkpoint review queue and decision panels.

## Implementation Steps

1. Add/upgrade navigator columns to show only children of selected parent.
2. Add full-path breadcrumb actions backed by path-store cascades.
3. Add layer-specific empty-state copy with actionable next step guidance.

## Files

**Create:**

- `tests/outline/pipeline-seven-layer-navigator.test.ts`
- `src/modules/outline/services/pipeline-seven-layer-navigator.ts`

**Update:**

- `src/modules/outline/components/HierarchyNavigator.svelte`
- `src/modules/project/components/HierarchyBreadcrumb.svelte`
- `src/routes/projects/[id]/outline/+page.svelte`
- `src/modules/outline/stores/outline-store.svelte.ts`

## Acceptance Criteria

- [x] User can drill from Arc through Stage in one navigator surface.
- [x] Breadcrumb always reflects current full path and supports ancestor jump.
- [x] Empty states are layer-aware and non-blocking.
- [x] No stage appears outside a selected beat scope.

## Edge Cases

- Missing parent data should render fallback guidance, not blank columns.
- Changing parent selection during deep selection must preserve UI stability.

## Notes

Do not introduce route-level redirects for layer selection; keep transitions local to store-driven state.
