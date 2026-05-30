# Artifact Review-Gate Integrity Evidence (2026-05-27)

## Files changed
- `src/lib/ai/pipeline/contracts.ts`
- `src/modules/nova/components/NovaSceneDraftCard.svelte`
- `src/modules/nova/components/NovaRevisionPackCard.svelte`
- `src/modules/nova/services/author-pipeline-runner.ts`
- `tests/nova/nova-artifact-cards.test.ts`

## Behavior delivered
- Artifact envelopes now carry model provenance (`model`) in addition to task/stage/time metadata.
- Author pipeline runner now records model metadata from completion responses into artifact envelopes.
- Scene draft and revision pack cards now render explicit provenance (`task`, `model`, `generated at`) and keep review-gate semantics explicit.
- Revision pack now has explicit copy behavior (`Copy JSON`) with graceful clipboard failure fallback.
- Source-contract tests assert no editor/manuscript mutation imports in artifact cards and author runner.

## Commands run
- `pnpm exec vitest run tests/nova/nova-artifact-cards.test.ts`
- `pnpm exec vitest run tests/nova/nova-artifact-cards.test.ts tests/nova/services/author-pipeline-runner.test.ts tests/nova/nova-panel-tools.test.ts tests/nova/nova-panel-chat.test.ts tests/nova/chat-service.test.ts tests/ai/prompt-builder.test.ts`

## Test results
- Artifact cards suite: `1` file / `6` tests passing.
- Combined targeted suite: `6` files / `48` tests passing.

## Known limitations
- Stage-003 phase-003 (canonical runtime/surface reconciliation) is still pending.
- Full stage-004 closeout quality gates remain pending.
