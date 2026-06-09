---
title: Canon Merge Tests
slug: part-001-canon-merge-tests
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-canon-merge-tests
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Prove accepted diff decisions produce expected canon state without partial mutations.

## Scope

**In scope:**

- Service tests for create/update/merge/link/no-op.
- Transaction rollback tests.
- Duplicate evidence tests.

**Out of scope:**

- Provider quality evaluation.
- Performance benchmarking unless tests reveal slowness.

## Implementation Steps

1. Seed in-memory canon entities.
2. Apply diff decisions and assert row changes/audit metadata.
3. Simulate invalid target or failure and assert rollback.
4. Save results under evidence.

## Files

**Create:**

- `evidence/canon-merge-tests-evidence-2026-06-09.md`

**Update:**

- `tests/ai/pipeline/worldbuild-canon-diff-apply.test.ts`

**Reference:**

- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/services/worldbuild-scan-contract.ts`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/worldbuilding.md`

## Acceptance Criteria

- [ ] Merge/update writes only intended fields.
- [ ] Rollback leaves canon unchanged on failure.
- [ ] No-op records lifecycle without canon mutation.

## Edge Cases

- JSON array normalization can make equality assertions brittle.
- Generated IDs need stable test injection or flexible matching.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
