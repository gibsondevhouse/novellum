# Docs Sync Evidence

Date: 2026-06-12

## Summary

Current developer and user docs now identify the outline checkpoint flow as canonical and mark the legacy direct apply path as retired.

## Updated Docs

- `dev-docs/03-ai/pipeline.md`
  - Write-mode outline routing now points at `outlineGenerationState.generate()` and `/api/ai/outline/generate`.
  - Documents `/api/nova/outline/apply` returning `410 outline_apply_retired`.
- `dev-docs/04-modules/nova.md`
  - Documents checkpoint-only outline generation and read-only legacy cards.
- `dev-docs/03-ai/agents-map.md`
  - Marks `vibe-author.outline` as a legacy parser/task contract.
- `dev-docs/03-ai/outline-generation.md`
  - Documents checkpoint-only materialization and retired direct apply route.
- `dev-docs/03-ai/context-engine.md`
  - Last verified date aligned with plan-043 consolidation.
- `novellum-docs/user/nova.md`
  - Adds user-facing explanation of outline checkpoints and read-only older outline artifact messages.

## Stale Reference Search

Command:

`rg -n 'runAuthorPipelineTask\\(AUTHOR_OUTLINE\\)|AUTHOR_OUTLINE|Apply To Outline|Pipeline artifact card|/api/nova/outline/apply|legacy outline apply is retired' dev-docs/03-ai dev-docs/04-modules novellum-docs/user src/modules/nova src/routes/api/nova tests/nova tests/routes`

Result:

- No `runAuthorPipelineTask(AUTHOR_OUTLINE)`, `AUTHOR_OUTLINE`, or `Pipeline artifact card` hits remain in current docs/source.
- `/api/nova/outline/apply` hits are limited to retired-route docs and route/source-contract tests.
- `Apply To Outline` hits are limited to negative assertions in `tests/nova/nova-artifact-cards.test.ts`.

## Verification

- Full static and test gates passed in `targeted-regression-evidence-2026-06-12.md`.
