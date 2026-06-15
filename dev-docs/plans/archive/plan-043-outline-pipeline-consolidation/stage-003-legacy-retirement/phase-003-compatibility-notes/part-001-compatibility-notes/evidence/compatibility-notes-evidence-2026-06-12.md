# Compatibility Notes Evidence

Date: 2026-06-12

## Summary

Compatibility strategy is now documented in current developer and user docs: generated outlines use checkpoints, and legacy outline artifacts are read-only.

## Docs Updated

- `dev-docs/03-ai/pipeline.md`
  - Write-mode outline routing now points to `outlineGenerationState.generate()` and `/api/ai/outline/generate`.
  - Documents `/api/nova/outline/apply` as retired.
- `dev-docs/04-modules/nova.md`
  - Documents checkpoint-only outline generation in Write mode.
  - Documents read-only legacy `author-outline` cards.
- `dev-docs/03-ai/agents-map.md`
  - Marks `vibe-author.outline` as a legacy parser/task contract only.
  - Points supported outline generation at `vibe-outline.draft` checkpoints.
- `dev-docs/03-ai/outline-generation.md`
  - Documents retired legacy apply route and checkpoint-only materialization.
- `dev-docs/03-ai/context-engine.md`
  - Last verified date updated for plan-043 consolidation.
- `novellum-docs/user/nova.md`
  - Adds user-facing outline checkpoint behavior and notes older outline artifact messages are read-only.

## Compatibility Decision

- No durable migration is needed because Nova session messages are in-memory.
- Already-open legacy `author-outline` cards can remain visible as read-only payload/copy output.
- Applying generated outlines must happen only through `NovaOutlineDraftCheckpointCard` and the checkpoint accept route.

## Validation

- `rg -n 'runAuthorPipelineTask\\(AUTHOR_OUTLINE\\)|AUTHOR_OUTLINE|/api/nova/outline/apply|Apply To Outline|Pipeline artifact card' dev-docs/03-ai dev-docs/04-modules novellum-docs/user src/modules/nova src/routes/api/nova tests/nova tests/routes`
  - Result: remaining hits are intentional legacy compatibility/source-contract/test references, not current user instructions.
