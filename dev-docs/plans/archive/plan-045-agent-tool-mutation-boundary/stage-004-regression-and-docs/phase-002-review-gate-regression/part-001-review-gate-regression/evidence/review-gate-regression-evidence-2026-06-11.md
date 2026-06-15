# Review Gate Regression Evidence — 2026-06-11

## Scope

Verified that explicit accept/reject flows still work while model-callable paths cannot apply manuscript or canon mutations.

## E2E Updates

- `tests/e2e/vibe-author-review-gates.spec.ts` now seeds canonical `authorDraftCheckpoints.v1` review records in the preview SQLite database, then exercises the public `/api/author-draft/checkpoints/{id}/accept` and `/reject` routes.
- The author e2e asserts explicit accept applies valid prose to the scene and explicit reject leaves the target scene unchanged.
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts` now uses the current `PipelineArtifactEnvelope` shape so populated-world-bible checkpoints exercise the shipped pipeline contract.

## Validation

- `pnpm test tests/nova/agent-tool-mutation-boundary.test.ts tests/nova/agent-source-contracts.test.ts tests/nova/tool-registry.test.ts tests/nova/tool-router.test.ts tests/nova/agent-loop.test.ts tests/nova/chat-service.test.ts tests/nova/checkpoint-card.contract.test.ts tests/nova/NovaOutlineDraftCheckpointCard.test.ts tests/nova/outline-checkpoint-actions.test.ts tests/world-building/worldbuild-proposal-canon-safety.test.ts tests/ai/pipeline/author-draft-checkpoint-service.test.ts tests/ai/pipeline/checkpoint-flow.test.ts` — passed, `12` files / `101` tests.
- `pnpm test:e2e --grep "vibe-author review-gate flow|outline generation review gate|vibe-worldbuild checkpoint flow" --project=chromium` — passed, `5` tests.
- `pnpm test` — passed, `240` files / `1756` tests.

## Result

Review-gated accept/reject behavior is preserved across author draft, outline, and worldbuilding flows. The e2e coverage now matches current route ownership: author draft mutations use the author-draft routes, outline acceptance uses the dedicated materialization route, and worldbuilding populated-bible acceptance uses the pipeline metadata route.
