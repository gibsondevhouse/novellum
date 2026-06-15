# Materialization Contract Evidence

Date: 2026-06-12

## Summary

Outline hierarchy writes remain owned by `acceptOutlineCheckpointMaterialization()` and the dedicated checkpoint accept route.

## Verified Contract

- `POST /api/outline/checkpoints/{checkpointId}/accept`
  - Delegates to `acceptOutlineCheckpointMaterialization()`.
  - Requires `projectId`, `expectedUpdatedAt`, and `expectedVersion`.
  - Returns safe error payloads from `OutlineMaterializationServiceError`.
- `acceptOutlineCheckpointMaterialization()`
  - Validates project, checkpoint owner, lifecycle, schema version, stale preconditions, and existing hierarchy conflicts.
  - Writes hierarchy rows and scene intent metadata in one SQLite transaction.
  - Updates checkpoint lifecycle to `accepted` as the final transactional write.
  - Rolls back hierarchy and metadata writes if checkpoint lifecycle update fails.
- Generic project metadata route
  - Supports outline upsert/review/reject.
  - Explicitly rejects outline `accept` with `409 invalid_transition`.
- Legacy apply route
  - No longer imports database helpers and returns `410 outline_apply_retired`.

## Existing Regression Coverage

- `tests/routes/outline-accept.test.ts`
  - Accept materializes hierarchy and marks checkpoint accepted.
  - Existing hierarchy returns `outline_conflict` and leaves checkpoint in review.
  - Forced checkpoint update failure rolls back hierarchy/metadata writes.
  - Non-review checkpoints and missing projects do not write hierarchy rows.
- `tests/routes/outline-checkpoints.test.ts`
  - Generic metadata upsert/review/reject do not mutate hierarchy.
  - Generic metadata accept remains blocked.
- `tests/routes/nova-outline-apply-route.test.ts`
  - Legacy route returns explicit retired behavior and has no hierarchy replacement SQL.

## Validation

- `pnpm test tests/routes/nova-outline-apply-route.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-accept.test.ts`
  - Result: passed as part of the 4-file targeted run, 20 tests total.
- `pnpm test tests/nova/nova-artifact-cards.test.ts tests/routes/nova-outline-apply-route.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-accept.test.ts tests/nova/mode-routing.test.ts tests/nova/chat-service.test.ts tests/nova/outline-generation-state.test.ts`
  - Result: passed, 7 files / 52 tests.
