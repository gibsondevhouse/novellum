# Outline Checkpoint Helper Validation - 2026-06-03

Part: `part-001-add-outline-checkpoint-owner-and-helpers`

## Implemented Helper Surface

- Added `src/lib/ai/pipeline/outline-checkpoint-contract.ts`.
- Updated `src/lib/ai/pipeline/index.ts`.
- Updated `src/lib/project-metadata.ts`.
- Added `tests/ai/pipeline/outline-checkpoint-contract.test.ts`.

## Contract Decisions

- Outline checkpoints use dedicated owner id `outlineDraftCheckpoints.v1`.
- Owner id is distinct from `vibe-worldbuild` and `authorDraftCheckpoints.v1`.
- Operation body helpers are explicit:
  - `createOutlineCheckpointUpsertBody()`
  - `createOutlineCheckpointReviewBody()`
  - `createOutlineCheckpointAcceptBody()`
  - `createOutlineCheckpointRejectBody()`
- Client wrappers are explicit:
  - `listOutlineCheckpoints()`
  - `upsertOutlineCheckpoint()`
  - `reviewOutlineCheckpoint()`
  - `acceptOutlineCheckpoint()`
  - `rejectOutlineCheckpoint()`
- Accept helpers require a `review` lifecycle target.
- Reject helpers require a `draft` or `review` lifecycle target.
- Empty checkpoint ids and empty reject reasons fail before a route call.
- Mutating helpers still fail in SSR/non-browser contexts.
- No hierarchy materialization helper was introduced.

## Verification

- `pnpm test tests/ai/pipeline/outline-checkpoint-contract.test.ts` - passed, 1 file / 6 tests.
- `pnpm check` - passed with 0 errors and 11 pre-existing Svelte warnings in world-building files.
- `pnpm lint` - passed.
- `pnpm lint:css` - not run; no UI or style files changed.
- `pnpm check:tokens` - not run; no UI or style files changed.

Initial `pnpm check` and `pnpm lint` runs caught test-only issues: a tuple inference error in the fetch mock helper and an unused `beforeEach` import. Both were fixed before the passing rerun.
