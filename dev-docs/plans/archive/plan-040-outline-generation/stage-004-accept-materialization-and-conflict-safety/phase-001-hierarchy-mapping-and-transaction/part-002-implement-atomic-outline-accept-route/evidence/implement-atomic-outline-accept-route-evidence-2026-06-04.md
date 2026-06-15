# Implement Atomic Outline Accept Route Evidence — 2026-06-04

## Summary

Implemented the dedicated outline checkpoint accept path:

- `src/lib/server/outline/outline-materialization-service.ts`
- `src/routes/api/outline/checkpoints/[checkpointId]/accept/+server.ts`
- `tests/routes/outline-accept.test.ts`

The generic project metadata route still blocks outline `accept` operations. Outline acceptance now goes through `/api/outline/checkpoints/[checkpointId]/accept`, which loads the checkpoint server-side, validates project/lifecycle/version, checks for existing hierarchy conflicts, materializes hierarchy rows plus scene intent metadata, and updates the checkpoint as the final write in the same transaction.

## Transaction And Safety Proof

Route coverage verifies:

- A review checkpoint materializes expected `arcs`, `acts`, default `milestones`, `chapters`, `scenes`, and scene intent metadata.
- The accepted checkpoint stores `projectionMode = atomic`, materialized counts, and `sceneIntentPersisted = true`.
- Existing hierarchy rows return `409` with `code = outline_conflict` and leave the checkpoint in `review`.
- A forced checkpoint-update failure after hierarchy and scene metadata inserts returns `500` and rolls back all hierarchy and scene metadata rows.
- Draft checkpoints and deleted projects are rejected without hierarchy writes.
- Client metadata helpers call HTTP routes and do not import DB utilities.

## Verification

Focused route suite:

```text
pnpm test tests/routes/outline-accept.test.ts

Test Files  1 passed (1)
Tests       5 passed (5)
```

Adjacent route/client/mapper/context bundle:

```text
pnpm test tests/routes/outline-accept.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-generation.test.ts tests/nova/outline-checkpoint-actions.test.ts tests/server/outline/outline-materialization-map.test.ts tests/ai/pipeline/author-draft-context.test.ts

Test Files  6 passed (6)
Tests       41 passed (41)
```

Type/Svelte check:

```text
pnpm check

svelte-check found 0 errors and 11 warnings in 3 files
```

The 11 warnings are pre-existing world-building/help warnings unrelated to this server/client-route part.

Lint:

```text
pnpm lint

Passed.
```

`pnpm lint:css` and `pnpm check:tokens` were not run for this part because no UI or style files changed.
