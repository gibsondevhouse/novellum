---
title: Define Pipeline Hierarchy Path Model
slug: part-001-define-pipeline-hierarchy-path-model
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-001-pipeline-hierarchy-path-contract
started_at: 2026-05-26T15:45:42Z
completed_at: 2026-05-26T16:15:16Z
estimated_duration: 2d
---

## Objective

Implement the `PipelineHierarchyPath` contract and validation/reset behavior used by the outline-first pipeline UI.

## Scope

**In scope:**

- Introduce `PipelineHierarchyPath` and strict parent-required invariants.
- Implement parent-clear cascades and stale-id repair behavior.
- Provide derived selection/readiness selectors for downstream panels/adapters.

**Out of scope:**

- Stage-run adapter calls.
- Checkpoint queue/review UI.

## Implementation Steps

1. Add the path type/model and path update APIs in the hierarchy store module.
2. Enforce validation invariants and descendant-reset behavior on all path mutations.
3. Add derived selectors for active labels, readiness, and invalid-state diagnostics.

## Files

**Create:**

- `tests/outline/pipeline-hierarchy-path-store.test.ts`

**Update:**

- `src/modules/project/stores/hierarchy-store.svelte.ts`
- `src/modules/outline/services/seven-layer-outline.ts`
- `src/modules/outline/types.ts`

## Acceptance Criteria

- [x] `PipelineHierarchyPath` requires parent IDs for every descendant layer.
- [x] Parent changes clear descendants deterministically.
- [x] Stale/deleted selected IDs are surfaced and repaired without crashing UI.
- [x] Unit tests cover valid, invalid, cascade-clear, and stale-path scenarios.

## Edge Cases

- Stage selected without beat must be impossible.
- External data refresh removing selected nodes must leave UI in safe fallback state.

## Notes

Use Svelte 5 Runes only (`$state`, `$derived`, `$effect`) and avoid duplicating path logic in components.
