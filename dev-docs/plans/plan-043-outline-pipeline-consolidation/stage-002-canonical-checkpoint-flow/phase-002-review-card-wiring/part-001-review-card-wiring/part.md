---
title: Review Card Wiring
slug: part-001-review-card-wiring
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-review-card-wiring
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Ensure generated outline proposals render through `NovaOutlineDraftCheckpointCard` with explicit reject and accept actions.

## Scope

**In scope:**

- Audit Nova message rendering and outline generation panel rendering.
- Remove or redirect old outline artifact card rendering where necessary.
- Keep conflict, stale, and failure copy from checkpoint actions.

**Out of scope:**

- Redesigning the visual style of Nova cards.
- Adding new outline editing controls.

## Implementation Steps

1. Inspect `NovaMessageLog`, `NovaOutlineCard`, and outline generation panel state.
2. Ensure checkpoint cards render for pending/review-ready outline checkpoints.
3. Remove or hide legacy apply buttons from old artifact cards.
4. Update component tests that assert outline card behavior.

## Files

**Create:**

- None

**Update:**

- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/NovaOutlineCard.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `tests/nova/nova-artifact-cards.test.ts`

**Reference:**

- `src/routes/api/ai/outline/generate/+server.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `src/lib/server/outline/outline-materialization-service.ts`
- `src/modules/nova/components/NovaOutlineGenerationPanel.svelte`
- `src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte`
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `dev-docs/03-ai/agents-map.md`
- `dev-docs/03-ai/context-engine.md`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [ ] The only outline UI that can apply hierarchy changes is the checkpoint card.
- [ ] Reject and accept actions remain explicit and visible.
- [ ] Legacy cards cannot trigger hierarchy replacement.

## Edge Cases

- Existing tests may import `NovaOutlineCard` directly.
- Historical messages may still contain legacy artifacts.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
