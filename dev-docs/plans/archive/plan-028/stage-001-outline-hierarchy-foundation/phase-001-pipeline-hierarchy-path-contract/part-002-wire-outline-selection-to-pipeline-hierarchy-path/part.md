---
title: Wire Outline Selection to Pipeline Hierarchy Path
slug: part-002-wire-outline-selection-to-pipeline-hierarchy-path
part_number: 2
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-pipeline-hierarchy-path-contract
started_at: 2026-05-26T16:01:00Z
completed_at: 2026-05-26T16:15:16Z
estimated_duration: 1d
---

## Objective

Bridge existing outline selection state to the `PipelineHierarchyPath` contract and apply stale-path repair when outline data refreshes.

## Scope

**In scope:**

- Delegate outline store selection mutations/getters to the canonical hierarchy-path store for the active project.
- Repair selection path against loaded outline data (`arcs/acts/milestones/chapters/scenes/beats/stages`).
- Add test coverage for bridge behavior and project-scoped selection consistency.

**Out of scope:**

- Seven-column navigator UI expansion.
- Stage orchestration run controls.

## Implementation Steps

1. Update `outline-store.svelte.ts` to proxy selection read/write behavior through hierarchy-path APIs.
2. Call path repair from outline page effects when hierarchy datasets are loaded/refreshed.
3. Add bridge tests covering selection passthrough and stale-node repair behavior.

## Files

**Create:**

- `tests/outline/outline-store-pipeline-path-bridge.test.ts`

**Update:**

- `src/modules/outline/stores/outline-store.svelte.ts`
- `src/routes/projects/[id]/outline/+page.svelte`

## Acceptance Criteria

- [x] Outline store selection APIs write into the canonical hierarchy-path store for the active project.
- [x] Outline page data refresh triggers deterministic path repair without crashing selection-dependent panels.
- [x] Project switching preserves scoped selection isolation.
- [x] New tests cover bridge behavior and stale-repair integration.

## Edge Cases

- Active project unset: selection operations must no-op safely.
- Stale selected scene/chapter IDs after remote deletes must repair to safe fallback.

## Notes

Part-001 remains in `review`; this part extends integration only and does not alter part-001 acceptance outcomes.
