# OutlineDraft Contract Validation - 2026-06-03

Part: `part-002-define-outline-draft-contract`

## Implemented Contract Surface

- Added `src/lib/ai/pipeline/outline-draft-contract.ts`.
- Added `src/lib/ai/pipeline/index.ts` as a narrow public barrel for pipeline contract exports.
- Added `tests/ai/pipeline/outline-draft-contract.test.ts`.
- Updated `dev-docs/03-ai/pipeline.md`.

## Contract Decisions

- `OUTLINE_DRAFT_TASK_KEY`: `vibe-outline.draft`.
- Checkpoint owner id: `outlineDraftCheckpoints.v1`.
- Schema version: `1.0.0`.
- Artifact version: `1`.
- Lifecycle values: `draft`, `review`, `accepted`, `rejected`.
- Generated outline hierarchy is nested Arc -> Act -> Chapter -> Scene.
- Every hierarchy node requires `id`, `slug`, `title`, and non-negative integer `order`.
- Every scene requires intent fields `goal`, `conflict`, `turn`, and `outcome`.
- Scene intent fields are capped at `1200` characters each for downstream context budget safety.
- `sourceContext` captures summary, included domains, entity counts, and optional context/prompt identifiers.
- Validation helpers return path-based diagnostics and do not return raw provider output.

## Edge Cases Covered

- Missing scene intent fields fail with field-level diagnostics.
- Duplicate node ids fail validation.
- Empty outlines and chapters with no scenes fail validation.
- Markdown/non-JSON model payload strings fail without leaking raw text.
- Overlong scene intent fails validation.
- Unknown checkpoint lifecycle values fail validation.
- Checkpoint `projectId` must match `draft.projectId`.

## Verification

- `pnpm test tests/ai/pipeline/outline-draft-contract.test.ts` - passed, 1 file / 8 tests.
- `pnpm check` - passed with 0 errors and 11 pre-existing Svelte warnings in world-building files.
- `pnpm lint` - passed.
- `pnpm lint:css` - not run; no UI or style files changed.
- `pnpm check:tokens` - not run; no UI or style files changed.
