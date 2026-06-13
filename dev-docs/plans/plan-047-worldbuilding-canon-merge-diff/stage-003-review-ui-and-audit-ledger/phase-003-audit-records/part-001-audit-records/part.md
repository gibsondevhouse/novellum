---
title: Audit Records
slug: part-001-audit-records
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-003-audit-records
started_at: 2026-06-12
completed_at: 2026-06-12
estimated_duration: TBD
---

## Objective

Make worldbuilding canon mutations explainable after the fact.

## Scope

**In scope:**

- Acceptance metadata for target IDs, fields changed, and projection mode.
- Rejection reasons and duplicate evidence retention.
- Audit display or retrievable metadata as appropriate.

**Out of scope:**

- Full undo/rollback UI unless explicitly added.
- External audit export.

## Implementation Steps

1. Extend acceptance/rejection metadata to capture diff decisions.
2. Persist changed field summaries and target IDs.
3. Add tests for audit metadata.
4. Update evidence README recommendations if useful.

## Files

**Create:**

- `tests/ai/pipeline/worldbuild-canon-audit.test.ts`
- `evidence/audit-records-evidence-2026-06-12.md`

**Update:**

- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
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

- [x] Accepted proposals record what changed and where.
- [x] Rejected proposals retain reason and review evidence.
- [x] Audit metadata validates with proposal schema.

## Edge Cases

- Audit payloads should not become huge copies of full entities.
- Sensitive prompt/raw model text should not be stored unnecessarily.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
