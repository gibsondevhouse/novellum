---
title: Diff Schema
slug: part-001-diff-schema
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-diff-schema
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Give worldbuilding proposal review a structured representation of field-level changes.

## Scope

**In scope:**

- Design diff record types and validation.
- Represent before/after values, target IDs, confidence, and evidence.
- Keep schema compatible with local-first project metadata storage.

**Out of scope:**

- Implementing UI rendering before schema acceptance.
- Broad database migration unless required.

## Implementation Steps

1. Draft TypeScript/Zod types for canon diff decisions.
2. Model create/update/merge/link/no-op decisions.
3. Add parser/validator tests.
4. Save schema design evidence.

## Files

**Create:**

- `src/lib/ai/pipeline/worldbuild-canon-diff-schema.ts`
- `tests/ai/pipeline/worldbuild-canon-diff-schema.test.ts`
- `evidence/diff-schema-evidence-2026-06-09.md`

**Update:**

- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`

**Reference:**

- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/services/worldbuild-scan-contract.ts`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/worldbuilding.md`

## Acceptance Criteria

- [ ] Diff schema validates all intended decision types.
- [ ] Schema includes enough evidence for author review.
- [ ] Malformed diffs fail safely.

## Edge Cases

- Diff values may include arrays/JSON fields.
- No-op should preserve audit trail without canon write.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
