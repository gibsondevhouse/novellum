---
title: Proposal Flow Tests
slug: part-001-proposal-flow-tests
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-proposal-flow-tests
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Ensure create/update/merge/reject proposal behavior remains review-gated and stable.

## Scope

**In scope:**

- Unit/component tests for proposal cards.
- Route tests for accept/reject lifecycle.
- Regression for existing create-only proposals.

**Out of scope:**

- Full visual snapshot suite unless UI layout changes materially.
- Real provider generation tests.

## Implementation Steps

1. Add tests for diff rendering and actions.
2. Run route/service tests for accept/reject.
3. Run existing worldbuilding proposal tests.
4. Save command output evidence.

## Files

**Create:**

- `evidence/proposal-flow-tests-evidence-2026-06-09.md`

**Update:**

- `tests/world-building/worldbuilding-proposal-card.test.ts`
- `tests/routes/worldbuilding-proposals-route.test.ts`

**Reference:**

- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/services/worldbuild-scan-contract.ts`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/worldbuilding.md`

## Acceptance Criteria

- [ ] Create-only proposals still work.
- [ ] Diff-aware proposals require explicit accept.
- [ ] Reject preserves reason and does not mutate canon.

## Edge Cases

- Mock provider fixtures may need schema updates.
- Pending proposal dedupe behavior must remain stable.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
