---
title: Wire Draft/Review Staging to Checkpoint Lifecycle
slug: part-001-wire-draft-review-staging-to-checkpoint-lifecycle
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-003-draft-review-staging-to-checkpoint-lifecycle
started_at: 2026-05-26T18:00:00Z
completed_at: 2026-05-26T19:10:00Z
estimated_duration: 3d
---

## Objective

Ensure every worldbuild stage run produces lifecycle-managed checkpoint artifacts with explicit transition visibility and no silent canonical writes.

## Scope

**In scope:**

- Stage-run completion path into checkpoint `draft` records.
- Explicit move-to-review operation path and UI feedback.
- Queue/review metadata hooks needed by upcoming checkpoint console stage.

**Out of scope:**

- Final accept/reject decision UI controls.
- New checkpoint storage schema or endpoint additions.

## Implementation Steps

1. Stage run artifacts into checkpoint `draft` using existing pipeline metadata scope.
2. Wire review transition calls and local lifecycle refresh behavior.
3. Expose lifecycle metadata needed by queue/detail/decision panels.

## Files

**Create:**

- `tests/outline/worldbuild-checkpoint-staging.test.ts`

**Update:**

- `src/modules/world-building/stores/world-building-store.svelte.ts`
- `src/routes/projects/[id]/outline/+page.svelte`
- `src/modules/nova/services/context-hooks.ts`

## Acceptance Criteria

- [x] Every successful run stages a `draft` checkpoint record.
- [x] Move-to-review operation updates lifecycle and is visible in UI state.
- [x] No canonical entity table writes occur at run/staging time.
- [x] Integration tests verify staging + review semantics and failure handling.

## Edge Cases

- Review transition on terminal states (`accepted`/`rejected`) must surface deterministic errors.
- Staging refresh race conditions must not duplicate local checkpoint entries.

## Notes

Reuse `PipelineArtifactEnvelope` and existing checkpoint service contracts from plan-027.
