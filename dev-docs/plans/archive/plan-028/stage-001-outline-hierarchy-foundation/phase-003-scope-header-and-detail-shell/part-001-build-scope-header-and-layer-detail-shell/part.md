---
title: Build Scope Header and Layer Detail Shell
slug: part-001-build-scope-header-and-layer-detail-shell
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-003-scope-header-and-detail-shell
started_at: 2026-05-26T16:32:06Z
completed_at: 2026-05-26T17:43:00Z
estimated_duration: 2d
---

## Objective

Implement a shared detail shell that shows active scope, layer metadata, and action affordances while enforcing stage-only orchestration entry.

## Scope

**In scope:**

- Shared scope header with full path and readiness summary.
- Layer-specific detail slots for Arc/Act/Milestone/Chapter/Scene/Beat/Stage.
- Action gating so orchestration controls appear only on Stage layer.

**Out of scope:**

- Orchestration API run calls.
- Checkpoint queue/review decision behavior.

## Implementation Steps

1. Add scope header component bound to derived hierarchy path context.
2. Add layer-aware detail shell slots and stage-specific action region.
3. Wire outline page to render proper detail panel for selected layer.

## Files

**Create:**

- `tests/outline/pipeline-scope-header-shell.test.ts`

**Update:**

- `src/routes/projects/[id]/outline/+page.svelte`
- `src/lib/components/ui/WorkspaceShell.svelte`
- `src/modules/outline/components/OutlineSummaryBar.svelte`
- `src/modules/outline/stores/outline-store.svelte.ts`

## Acceptance Criteria

- [x] Active path and current layer are always visible in detail workspace.
- [x] Stage action region is hidden on non-stage layers.
- [x] Layer detail shell handles empty selection and stale selection safely.
- [x] Unit/component tests cover header rendering and action gating.

## Edge Cases

- Route reload with stale selected IDs must resolve to safe fallback state.
- Rapid selection changes must not render mismatched layer metadata.

## Notes

Keep shell patterns consistent with existing `WorkspaceShell` primitives.
