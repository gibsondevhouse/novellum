# Outline Generation Route Validation — 2026-06-03

## Scope

Implemented `src/routes/api/ai/outline/generate/+server.ts`, added `selectOutlineGenerationModel()` to `src/lib/ai/model-router.ts`, and covered the route in `tests/routes/outline-generation.test.ts`.

## Contract

The route:

- validates `projectId`, optional `instruction`, and `confirmContextReady`
- builds an outline context packet from server-side DB rows
- blocks low-context requests before credential lookup/provider calls
- loads credentials through the existing credential service
- invokes the existing provider abstraction, not direct SDK/browser OpenRouter clients
- sends the prompt bundle response-format JSON schema
- retries once with the bounded repair prompt after schema validation failure
- validates model output with `validateOutlineDraft`
- persists valid output through outline checkpoint service only
- moves the checkpoint to `review`
- never writes hierarchy tables during generation
- never returns raw provider output

## Edge Cases Covered

- Missing API key returns `401 no_credentials` with safe message and no provider call.
- Low-context project returns `422 context_not_ready` with prerequisite codes and no provider call.
- Valid model output creates one pipeline checkpoint and no hierarchy rows.
- First invalid output can be repaired by one valid retry.
- Invalid output after repair returns `422 schema_validation_failed`, no checkpoint, no hierarchy writes, and no raw output in response.
- Dynamic table loading was reviewed and replaced with a static query whitelist.

## Verification

- `pnpm test tests/routes/outline-generation.test.ts`
  - Pass, 1 file / 5 tests.
- `pnpm check`
  - Pass, 0 errors.
  - 11 pre-existing Svelte warnings in world-building components/help page.
- `pnpm lint`
  - Pass.
- `pnpm test tests/routes/outline-generation.test.ts tests/routes/outline-checkpoints.test.ts tests/ai/pipeline/outline-generation-prompt.test.ts tests/ai/pipeline/outline-context-builder.test.ts tests/ai/pipeline/outline-context-sufficiency.test.ts tests/ai/pipeline/context-hierarchy-mapping.test.ts tests/ai/pipeline/outline-draft-contract.test.ts tests/ai/pipeline/outline-checkpoint-contract.test.ts`
  - Pass, 8 files / 55 tests.

No UI/style files changed; `pnpm lint:css` and `pnpm check:tokens` were not applicable.
