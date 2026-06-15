# Rollback Test Plan — 2026-06-04 Execution

## Scenario

Force a materialization failure after hierarchy rows and scene metadata have been inserted, but before the checkpoint lifecycle update completes.

The route test creates a SQLite trigger on the checkpoint metadata update:

```text
fail_outline_checkpoint_accept_update
```

That trigger raises a failure only when the accept route attempts the final pipeline checkpoint update.

## Expected Behavior

- Route returns `500` with `code = materialization_failed`.
- Response does not expose raw SQLite text or trigger internals.
- All hierarchy rows inserted earlier in the transaction are rolled back.
- Scene intent metadata rows are rolled back.
- The checkpoint remains in `review`.
- Nova shows recovery copy that the materialization was rolled back and the proposal is still pending review.

## Verification

Focused rollback tests:

```text
pnpm test tests/routes/outline-accept.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts

Test Files  2 passed (2)
Tests       13 passed (13)
```

Broader touched Plan 040 bundle:

```text
pnpm test tests/routes/outline-checkpoint-audit.test.ts tests/routes/outline-accept.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-generation.test.ts tests/server/outline/outline-conflict-preflight.test.ts tests/server/outline/outline-materialization-map.test.ts tests/nova/outline-checkpoint-actions.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-generation-runner.test.ts tests/nova/outline-generation-ux-states.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts tests/ai/pipeline/author-draft-context.test.ts

Test Files  12 passed (12)
Tests       76 passed (76)
```

Quality gates:

```text
pnpm check
svelte-check found 0 errors and 11 warnings in 3 files

pnpm lint
Passed.

pnpm check:tokens
Token enforcement: 347 files scanned, 0 violations.

pnpm exec stylelint src/modules/nova/components/NovaOutlineDraftCheckpointCard.svelte
Passed.
```

Full `pnpm lint:css` still fails on the pre-existing unrelated issue:

```text
src/modules/world-building/components/IndividualsWorkspaceShell.svelte
183:3  Duplicate property "text-align"
```
