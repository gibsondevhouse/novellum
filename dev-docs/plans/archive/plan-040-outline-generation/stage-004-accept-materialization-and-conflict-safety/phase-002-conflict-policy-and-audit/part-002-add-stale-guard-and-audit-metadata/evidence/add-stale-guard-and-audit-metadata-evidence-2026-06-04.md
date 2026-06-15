# Add Stale Guard and Audit Metadata Evidence — 2026-06-04

## Summary

Implemented accept preconditions and richer audit metadata for outline checkpoints.

Accept requests now carry:

- `expectedUpdatedAt`
- `expectedVersion`

The server rejects missing or mismatched preconditions before materialization. The final checkpoint update also includes `updatedAt = expectedUpdatedAt` in the SQL `WHERE` clause, so a race between load and update returns `stale_checkpoint` and rolls back transaction work.

Accepted checkpoint audit metadata now includes:

- `materializedCounts`
- `hierarchyRootIds.arcIds`
- `sceneIntentPersisted`
- `acceptedAt`
- `acceptedBy`
- `note`

Reject still runs through the metadata lifecycle route, stores `rejectedAt`, `rejectedBy`, and trimmed `reason`, and does not write hierarchy rows.

## Verification

Focused stale/audit/contract bundle:

```text
pnpm test tests/routes/outline-checkpoint-audit.test.ts tests/routes/outline-accept.test.ts tests/nova/outline-checkpoint-actions.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts

Test Files  4 passed (4)
Tests       18 passed (18)
```

Broader Plan 040 touched bundle:

```text
pnpm test tests/routes/outline-checkpoint-audit.test.ts tests/routes/outline-accept.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-generation.test.ts tests/server/outline/outline-conflict-preflight.test.ts tests/server/outline/outline-materialization-map.test.ts tests/nova/outline-checkpoint-actions.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-generation-runner.test.ts tests/nova/outline-generation-ux-states.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts tests/ai/pipeline/author-draft-context.test.ts

Test Files  12 passed (12)
Tests       75 passed (75)
```

Type/Svelte check:

```text
pnpm check

svelte-check found 0 errors and 11 warnings in 3 files
```

The 11 warnings are pre-existing world-building/help warnings unrelated to this part.

Lint:

```text
pnpm lint

Passed.
```

`pnpm lint:css` and `pnpm check:tokens` were not run for this part because no UI or style files changed.
