---
title: Implement Worldbuild Checkpoints
slug: part-001-implement-worldbuild-checkpoints
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-002-worldbuild-checkpoint-flow
started_at: 2026-05-26T19:00:00Z
completed_at: 2026-05-26T20:15:00Z
estimated_duration: 3d
---

## Objective

Implement review/accept checkpoint persistence and projection from staged worldbuild artifacts into canonical tables.

## Scope

**In scope:**

- Checkpoint contract and persistence service.
- Metadata scope updates to support pipeline checkpoint storage.
- Explicit accept/reject projection logic into canonical tables.

**Out of scope:**

- Author-stage checkpoint handling.
- Bulk migration of legacy draft notes into checkpoint records.

## Implementation Steps

1. Add checkpoint contract + service for stage artifact storage.
2. Extend project-metadata scope handling for pipeline-owned checkpoint records.
3. Wire accept/reject behavior so canonical table updates happen only on accept.

## Files

**Create:**

- `src/lib/ai/pipeline/checkpoint-contract.ts`
- `src/lib/ai/pipeline/checkpoint-service.ts`
- `tests/ai/pipeline/checkpoint-flow.test.ts`
- `tests/routes/project-metadata-pipeline-scope.test.ts`

**Update:**

- `src/lib/project-metadata.ts`
- `src/lib/server/project-metadata/project-metadata-service.ts`
- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/+server.ts`
- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`
- `src/modules/world-building/stores/world-building-store.svelte.ts`
- `src/modules/nova/services/context-hooks.ts`

## Acceptance Criteria

- [ ] Checkpoint lifecycle supports `draft -> review -> accepted` plus reject path.
- [ ] Accepted worldbuild artifacts project into canonical tables only after explicit action.
- [ ] Rejected artifacts preserve rationale and leave canonical state unchanged.
- [ ] Route/service tests verify scope validation and serialization behavior.

## Edge Cases

- Concurrent accept actions must avoid double-apply behavior.
- Invalid checkpoint payload versions must fail with non-destructive errors.

## Notes

Use versioned checkpoint payloads so future schema evolution stays backward-compatible.
