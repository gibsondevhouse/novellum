# Outline Checkpoint Route Lifecycle - 2026-06-03

Part: `part-002-cover-pipeline-metadata-route-lifecycle`

## Implemented Route Surface

- Added `src/lib/ai/pipeline/outline-checkpoint-service.ts`.
- Updated `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`.
- Added `tests/routes/outline-checkpoints.test.ts`.

## Route Behavior

- Pipeline metadata `PUT` dispatches to the outline checkpoint service when `ownerId` is `outlineDraftCheckpoints.v1`.
- Supported outline metadata operations:
  - `upsert`: validates and stores an `OutlineDraftCheckpointRecord` as `draft`.
  - `review`: moves `draft` or existing `review` checkpoints to `review`.
  - `reject`: moves `draft` or `review` checkpoints to `rejected`.
- Generic metadata `accept` for outline checkpoints returns `409 invalid_transition` until the later atomic materialization route is implemented.
- List behavior uses the existing `[ownerId]/+server.ts` route and stays project/owner scoped.
- Hierarchy tables are not written during outline checkpoint upsert, review, or reject.

## Deviation

The planned update path named an optional-key route folder. The repo uses two concrete SvelteKit routes instead:

- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/+server.ts`
- `src/routes/api/db/project-metadata/[projectId]/[scope]/[ownerId]/[key]/+server.ts`

The keyed route was updated. The list route was verified through tests and did not require source changes.

## Edge Cases Covered

- Malformed JSON body returns `400`.
- Unknown operation value returns `400 invalid_payload`.
- Project-scoped list excludes another project's checkpoint.
- Outline `accept` is blocked on the generic metadata route.
- Upsert/reject leave `arcs`, `acts`, `chapters`, `scenes`, `beats`, and `stages` untouched.

## Verification

- `pnpm test tests/routes/outline-checkpoints.test.ts` - passed, 1 file / 6 tests after fixing a test DB mock setup issue.
- `pnpm test tests/routes/outline-checkpoints.test.ts tests/routes/project-metadata-pipeline-scope.test.ts` - passed, 2 files / 10 tests.
- `pnpm test tests/ai/pipeline/outline-draft-contract.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/project-metadata-pipeline-scope.test.ts` - passed, 4 files / 24 tests.
- `pnpm check` - passed with 0 errors and 11 pre-existing Svelte warnings in world-building files after fixing a literal owner-id narrowing issue.
- `pnpm lint` - passed.
- `pnpm lint:css` - not run; no UI or style files changed.
- `pnpm check:tokens` - not run; no UI or style files changed.
