---
title: Artifact Card Retirement
slug: part-001-artifact-card-retirement
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-artifact-card-retirement
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Remove the UI affordance that applies legacy `author-outline` artifacts to the outline board.

## Scope

**In scope:**

- Remove apply action from legacy card or remove the card from rendering.
- Update exports and tests that still reference legacy card behavior.
- Keep read-only historical display only if the risk map requires it.

**Out of scope:**

- Changing checkpoint card styling.
- Deleting unrelated Nova artifact card types.

## Implementation Steps

1. Trace `NovaOutlineCard` imports, exports, and test mounts.
2. Remove or convert apply affordance according to the compatibility decision.
3. Update tests to assert the new non-mutating behavior.
4. Verify Nova message rendering still works for supported artifacts.

## Files

**Create:**

- None

**Update:**

- `src/modules/nova/components/NovaOutlineCard.svelte`
- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/index.ts`
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

- [ ] No visible legacy outline card button can apply hierarchy changes.
- [ ] Supported outline checkpoint cards still work.
- [ ] Exports do not expose retired mutation helpers unnecessarily.

## Edge Cases

- Removing a component can break Storybook or visual tests if imported directly.
- Read-only legacy display should not imply the draft is still applyable.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
