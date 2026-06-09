---
title: Merge Action Flow
slug: part-001-merge-action-flow
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-merge-action-flow
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Replace insert-only acceptance with create/update/merge/link/no-op execution where supported.

## Scope

**In scope:**

- Server-side diff application.
- Atomic transactions and rollback behavior.
- Status/error responses for unsupported decisions.

**Out of scope:**

- Automatic background canon updates.
- Cloud sync/conflict resolution.

## Implementation Steps

1. Implement diff application service for selected families.
2. Update proposal accept route to use diff decisions.
3. Add route/service tests for create/update/merge/no-op.
4. Capture rollback evidence.

## Files

**Create:**

- `src/lib/ai/pipeline/worldbuild-canon-diff-apply.ts`
- `tests/ai/pipeline/worldbuild-canon-diff-apply.test.ts`
- `evidence/merge-action-flow-evidence-2026-06-09.md`

**Update:**

- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts`

**Reference:**

- `src/lib/ai/pipeline/checkpoint-service.ts`
- `src/lib/ai/pipeline/worldbuild-proposal-schema.ts`
- `src/routes/api/worldbuilding/scan/+server.ts`
- `src/modules/world-building/components/WorldbuildingProposalCard.svelte`
- `src/modules/world-building/services/worldbuild-scan-contract.ts`
- `dev-docs/03-ai/agents-map.md`
- `novellum-docs/user/worldbuilding.md`

## Acceptance Criteria

- [ ] Accepted create/update/merge decisions write expected canon rows.
- [ ] Unsupported decisions fail safely without partial writes.
- [ ] No-op decisions update proposal lifecycle without canon writes.

## Edge Cases

- Existing proposal records may lack diff payloads and need create fallback.
- Foreign key/link targets must be validated before transaction.

## Notes

Keep this part scoped to Worldbuilding Canon Merge Diff. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
