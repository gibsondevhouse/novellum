# Generation Entrypoint Evidence

Date: 2026-06-12

## Summary

Write-mode outline build prompts now use the canonical outline checkpoint generation state instead of the legacy `runAuthorPipelineTask(AUTHOR_OUTLINE)` path.

## Runtime Changes

- `src/modules/nova/services/chat-service.ts`
  - Removed the Write-mode outline dependency on `PIPELINE_TASK_KEYS.AUTHOR_OUTLINE` and `runAuthorPipelineTask`.
  - Added checkpoint generation routing through `outlineGenerationState.generate(projectId, instruction)`.
  - Appends a Nova completion message that points the user to checkpoint review when generation succeeds.
  - Preserves the existing no-project error path and unsupported concrete Write-mode fallback.
- `src/modules/nova/stores/outline-generation-state.svelte.ts`
  - Extended `generate()` to accept an optional caller instruction and pass it to the outline generation runner.
  - Preserves the existing `confirmContextReady: true`, pending checkpoint, retry, cancellation, failure, and `review-ready` state transitions.

## Test Changes

- `tests/nova/mode-routing.test.ts`
  - Replaced the legacy `AUTHOR_OUTLINE` routing assertion with a checkpoint generation assertion.
  - Confirms no `author-outline` artifact is attached for supported Write-mode outline prompts.
- `tests/nova/chat-service.test.ts`
  - Adds direct coverage that Write-mode outline prompts call checkpoint generation and avoid streaming/legacy artifacts.
- `tests/nova/outline-generation-state.test.ts`
  - Adds coverage that caller instructions are normalized and included in the `/api/ai/outline/generate` runner body.

## Acceptance Criteria

- Supported outline generation requests produce checkpoint-backed review artifacts:
  - Covered by Write-mode routing to `outlineGenerationState.generate()` and existing `NovaOutlineGenerationPanel` path.
- No supported path creates a legacy `author-outline` artifact for application:
  - Covered by updated unit assertions that Write-mode outline prompts do not call `runAuthorPipelineTask` and do not attach an `author-outline` artifact.
- Existing outline generation review e2e remains meaningful:
  - Targeted Playwright review-gate spec still exercises review, reject, accept, and conflict-blocked accept behavior.

## Validation

- `pnpm test tests/nova/mode-routing.test.ts tests/nova/chat-service.test.ts tests/nova/outline-generation-state.test.ts tests/nova/outline-generation-runner.test.ts`
  - Result: passed, 4 files / 40 tests.
- `pnpm check`
  - Result: passed, 0 errors / 0 warnings.
- `pnpm lint`
  - Result: passed.
- `pnpm lint:css`
  - Result: passed.
- `pnpm check:tokens`
  - Result: passed, 347 files scanned / 0 violations.
- `pnpm test:e2e --grep "outline generation review gate" --project=chromium`
  - Result: passed, 2 tests.
- `pnpm test`
  - Result: passed, 240 files / 1758 tests.

## Follow-Up Notes

- `runAuthorPipelineTask(AUTHOR_OUTLINE)` still exists as lower-level legacy residue; Stage 003 owns the parser/task retirement decision.
- `NovaOutlineCard`, `outline-artifact-apply.ts`, and `/api/nova/outline/apply` remain unchanged in this part; Stage 002 Phase 002 and Stage 003 own their read-only/disable/removal work.
