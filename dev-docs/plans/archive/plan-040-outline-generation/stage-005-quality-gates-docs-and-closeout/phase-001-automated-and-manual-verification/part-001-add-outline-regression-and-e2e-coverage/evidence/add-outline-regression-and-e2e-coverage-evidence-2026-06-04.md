# Add Outline Regression and E2E Coverage Evidence — 2026-06-04

## Scope

- Added `tests/e2e/outline-generation-review.spec.ts`.
- Added `tests/routes/outline-no-silent-write-regression.test.ts`.
- Did not edit `playwright.config.ts`: current config already matches `tests/e2e/**/*.spec.ts`; this is the planned-file deviation.

## Coverage Added

- Playwright API e2e covers fixture-backed generated outline lifecycle:
  - draft checkpoint upsert -> review -> reject, with zero hierarchy rows written.
  - draft checkpoint upsert -> review -> explicit accept, with arcs/acts/milestones/chapters/scenes materialized.
  - existing arc conflict -> accept returns `409 outline_conflict`, no generated hierarchy rows are added, checkpoint remains `review`.
- Vitest route regression covers mocked provider generation:
  - valid provider JSON creates a `review` checkpoint only and writes zero hierarchy rows.
  - explicit materialization accept writes hierarchy rows and scene intent metadata.
  - reject leaves hierarchy tables untouched.
  - generation emits `outlineConflict` when hierarchy exists, and accept blocks without additional writes.

## Determinism

- No live provider calls are required.
- Route tests mock provider, credential, preference, and Ollama dependencies.
- E2E uses fixture-backed outline drafts through canonical app endpoints.

## Verification

- `pnpm test tests/routes/outline-no-silent-write-regression.test.ts`
  - Passed: 1 file / 3 tests.
- `pnpm test tests/routes/outline-no-silent-write-regression.test.ts tests/routes/outline-generation.test.ts tests/routes/outline-accept.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-checkpoint-audit.test.ts`
  - Passed: 5 files / 23 tests.
- `pnpm build`
  - Passed.
  - Existing Svelte/CSS warnings observed in world-building/help and Tailwind utility minification output.
- `pnpm exec playwright test tests/e2e/outline-generation-review.spec.ts --project=chromium`
  - Passed after rebuild: 2 tests.
  - First run failed against a stale preview build that still expected the old checkpoint `artifact` envelope; rebuild resolved it.
- `pnpm check`
  - Passed: 0 errors / 11 pre-existing warnings in 3 files.
- `pnpm lint`
  - Passed.

## Notes

- No UI/style files changed, so `pnpm lint:css` and `pnpm check:tokens` were not re-run for this part.
- No desktop/Tauri shell is required; the Playwright spec is API-level and uses the preview server.
