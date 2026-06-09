---
title: Current Write Map
slug: part-001-current-write-map
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-current-write-map
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Identify every canon write performed when worldbuilding artifacts are accepted.

## Scope

**In scope:**

- Audit `applyProposalProjection` and `applyPopulatedBibleProjection`.
- Map table writes, required fields, generated IDs, and omitted fields.
- Record transaction boundaries and acceptance metadata.

**Out of scope:**

- Changing projection behavior during audit.
- Adding new entity types.

## Implementation Steps

1. Read worldbuilding checkpoint/proposal projection services.
2. List table writes by category and entity kind.
3. Identify insert/update/delete behavior and atomicity.
4. Save current write map evidence.

## Files

**Create:**

- `evidence/current-write-map-evidence-2026-06-09.md`

**Update:**

- None

**Reference:**

- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/services/worldbuild-scan-contract.ts`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/worldbuilding.md`

## Acceptance Criteria

- [ ] All canon table writes are mapped.
- [ ] Insert-only behavior is documented by entity family.
- [ ] Transaction and audit fields are identified.

## Edge Cases

- Checkpoint and proposal projection paths differ.
- Some generated fields may be dropped during projection.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
