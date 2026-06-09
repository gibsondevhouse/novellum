---
title: Materialization Contract
slug: part-001-materialization-contract
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-003-materialization-contract
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Verify the dedicated checkpoint accept route owns hierarchy writes and retains conflict/stale/transaction guarantees.

## Scope

**In scope:**

- Review `acceptOutlineCheckpointMaterialization` and dedicated accept route.
- Confirm generic metadata and legacy routes cannot accept outline hierarchy directly.
- Add route/service regression tests if gaps exist.

**Out of scope:**

- Rewriting materialization map semantics.
- Changing outline row table shapes.

## Implementation Steps

1. Inspect materialization service preconditions and transaction boundary.
2. Trace all outline accept route callers.
3. Add assertions that legacy/generic paths cannot materialize outline checkpoints.
4. Record rollback/conflict evidence.

## Files

**Create:**

- `evidence/materialization-contract-evidence-2026-06-09.md`

**Update:**

- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `tests/routes/outline-checkpoint-accept-route.test.ts`

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

- [ ] Outline hierarchy writes are reachable only through the dedicated accept route.
- [ ] Existing conflict and stale guards remain covered.
- [ ] Generic metadata accept for outline checkpoints stays blocked.

## Edge Cases

- Route-level behavior may be duplicated in tests with older contracts.
- Transaction failure messages must remain user-safe.

## Notes

Keep this part scoped to Outline Pipeline Consolidation. If implementation reveals a larger dependency, document it in `impl.log.md` before expanding scope.
