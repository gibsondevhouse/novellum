---
title: Review & Mutation Surfaces
slug: part-001-review-and-mutation-surfaces
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-002-review-and-mutation-surfaces
started_at: 2026-06-15T00:00:00-04:00
completed_at: 2026-06-15T00:00:00-04:00
estimated_duration: 1h
---

## Objective

Make AI review and mutation surfaces consistent, explicit, and safe across outline, author draft, and world-building workflows.

## Scope

**In scope:**

- Standardize accept, reject, stale, conflict, diff, and success states across review cards.
- Align Nova artifact cards with author-only mutation boundaries.
- Ensure UI copy and control placement make review gates unmistakable.

**Out of scope:**

- Allowing automatic manuscript or canon mutation by the model.
- Replacing canonical backend accept/reject routes.

## Implementation Steps

1. Review outputs from plans 043, 045, 046, and 047.
2. Inventory all current review cards, proposal cards, mutation buttons, and decision state messages.
3. Consolidate shared review-state presentation where the codebase supports it.
4. Update tests for accepted, rejected, stale, conflicted, and failed states.
5. Save review surface evidence under this part.

## Files

**Create:**

- `evidence/review-and-mutation-surfaces-2026-06-15.md`

**Update:**

- `src/modules/nova/components/NovaAuthorDraftCheckpointCard.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `src/modules/nova/components/NovaSceneDraftCard.svelte`
- `src/modules/nova/components/NovaRevisionPackCard.svelte`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/components/WorldbuildingProposedTile.svelte`
- `src/modules/world-building/components/WorldbuildingGenerationStatus.svelte`
- `tests/nova/checkpoint-card.contract.test.ts`
- `tests/nova/outline-checkpoint-actions.test.ts`
- `tests/outline/worldbuild-checkpoint-decision-flow.test.ts`
- `tests/e2e/vibe-author-review-gates.spec.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`

**Reference:**

- `dev-docs/plans/plan-043-outline-pipeline-consolidation/plan.md`
- `dev-docs/plans/plan-045-agent-tool-mutation-boundary/plan.md`
- `dev-docs/plans/plan-046-pipeline-checkpoint-contract-reconciliation/plan.md`
- `dev-docs/plans/plan-047-worldbuilding-canon-merge-diff/plan.md`

## Acceptance Criteria

- [x] Outline checkpoints, author drafts, and worldbuilding proposals share clear review language.
- [x] No model-callable path is presented as an author acceptance action.
- [x] Accepted, rejected, stale, conflicted, and failed states are visually distinguishable.

## Edge Cases

- A proposal can become stale after underlying manuscript or canon content changes.
- A rejected item should remain understandable in history without looking actionable.

## Evidence

- [Review And Mutation Surfaces (2026-06-15)](./evidence/review-and-mutation-surfaces-2026-06-15.md)

## Notes

This is a safety-sensitive frontend pass. Review controls must remain explicit human actions.
