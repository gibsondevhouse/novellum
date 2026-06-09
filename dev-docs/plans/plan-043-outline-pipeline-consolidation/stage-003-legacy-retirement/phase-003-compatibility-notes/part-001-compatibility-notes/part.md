---
title: Compatibility Notes
slug: part-001-compatibility-notes
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-003-compatibility-notes
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Leave future maintainers with explicit compatibility guidance after the legacy path is retired.

## Scope

**In scope:**

- Write developer notes for retired route behavior.
- Document persisted legacy artifact handling.
- Update user-facing docs only if authors can encounter legacy cards.

**Out of scope:**

- Building a migration wizard unless the expanded plan discovers one is required.
- Changing active plan trackers.

## Implementation Steps

1. Record the retired route and UI behavior in relevant dev docs.
2. Add comments only where they prevent accidental route resurrection.
3. Update plan evidence with the compatibility decision.
4. Verify docs do not recommend the retired path.

## Files

**Create:**

- `evidence/compatibility-notes-evidence-2026-06-09.md`

**Update:**

- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/nova.md`
- `dev-docs/plans/plan-043-outline-pipeline-consolidation/plan.md`

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

- [ ] Docs name the checkpoint path as canonical.
- [ ] Legacy path behavior is documented as retired or unsupported.
- [ ] No user doc instructs authors to use old outline artifact apply.

## Edge Cases

- Over-documenting retired internals can confuse users.
- Inline comments should be minimal and tied to actual compatibility code.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
