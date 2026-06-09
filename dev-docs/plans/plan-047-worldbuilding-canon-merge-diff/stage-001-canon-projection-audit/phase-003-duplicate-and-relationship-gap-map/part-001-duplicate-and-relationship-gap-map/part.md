---
title: Duplicate & Relationship Gap Map
slug: part-001-duplicate-and-relationship-gap-map
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-003-duplicate-and-relationship-gap-map
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Identify where exact name dedupe is insufficient and where accepted proposals should link existing canon entities.

## Scope

**In scope:**

- Audit dedupe key logic and canon name checks.
- Map relationship tables and related ID fields.
- Identify semantic duplicate and relationship evidence needs.

**Out of scope:**

- Implementing vector search unless selected later.
- Automatic merge without author review.

## Implementation Steps

1. Review scan dedupe and proposal schema.
2. Map relationship/link-capable fields across canon tables.
3. Identify duplicate false-positive/false-negative risks.
4. Save duplicate and relationship gap evidence.

## Files

**Create:**

- `evidence/duplicate-and-relationship-gap-map-evidence-2026-06-09.md`

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

- [ ] Exact dedupe limits are documented.
- [ ] Relationship/link gaps are listed by entity family.
- [ ] Review evidence requirements for duplicates are defined.

## Edge Cases

- Semantic duplicate detection can be expensive or noisy.
- Names/titles alone may be insufficient in large worlds.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
