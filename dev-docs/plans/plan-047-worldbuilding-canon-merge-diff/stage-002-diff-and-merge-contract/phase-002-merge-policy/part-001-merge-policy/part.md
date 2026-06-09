---
title: Merge Policy
slug: part-001-merge-policy
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-merge-policy
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Specify what fields can be updated, appended, linked, or left untouched during proposal acceptance.

## Scope

**In scope:**

- Policy for initial entity families selected by audit.
- Field conflict handling and author choice semantics.
- Atomic write expectations.

**Out of scope:**

- Full semantic memory/retrieval implementation.
- Silent overwrite of existing canon.

## Implementation Steps

1. Choose initial entity families for implementation.
2. Define field-level merge rules and conflict handling.
3. Document transaction and rollback behavior.
4. Save merge policy evidence.

## Files

**Create:**

- `evidence/merge-policy-evidence-2026-06-09.md`

**Update:**

- `src/lib/ai/pipeline/checkpoint-service.ts`

**Reference:**

- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/services/worldbuild-scan-contract.ts`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/worldbuilding.md`

## Acceptance Criteria

- [ ] Merge policy is explicit and bounded.
- [ ] No field overwrite occurs without visible author approval.
- [ ] Atomicity expectations are documented.

## Edge Cases

- Appending tags/traits can create duplicates.
- Updating existing lore may need provenance notes.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
