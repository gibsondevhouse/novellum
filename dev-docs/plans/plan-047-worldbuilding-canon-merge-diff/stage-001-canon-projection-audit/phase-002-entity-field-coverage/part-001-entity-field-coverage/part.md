---
title: Entity Field Coverage
slug: part-001-entity-field-coverage
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-entity-field-coverage
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Identify fields lost during projection and fields that need diff/merge support.

## Scope

**In scope:**

- Compare schemas, DB tables, domain types, and UI forms.
- Document missing fields and normalization behavior.
- Prioritize entity families for initial merge support.

**Out of scope:**

- Implementing field migration.
- Changing generation prompts.

## Implementation Steps

1. Compare proposal payload schemas to DB schema/domain types.
2. Inspect worldbuilding forms for editable fields.
3. List missing or dropped fields by entity family.
4. Save field coverage evidence.

## Files

**Create:**

- `evidence/entity-field-coverage-evidence-2026-06-09.md`

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

- [ ] Field coverage gaps are documented by entity family.
- [ ] Initial merge target families are recommended.
- [ ] Dropped fields are separated from intentionally ignored fields.

## Edge Cases

- Some JSON columns need normalization before diffing.
- UI labels may differ from DB field names.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
