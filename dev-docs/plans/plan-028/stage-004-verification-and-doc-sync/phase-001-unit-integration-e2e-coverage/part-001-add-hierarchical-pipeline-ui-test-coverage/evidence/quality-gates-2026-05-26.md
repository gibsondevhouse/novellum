# Quality Gates — part-001 phase-001 stage-004

**Date:** 2026-05-26
**Agent:** Claude Code

## Results

| Gate          | Command            | Result |
| ------------- | ------------------ | ------ |
| typecheck     | `pnpm check`       | 1683 files, 0 errors, 0 warnings |
| lint          | `pnpm lint`        | 0 errors |
| lint_css      | `pnpm lint:css`    | 0 errors |
| tests         | `pnpm test`        | 187 files / 1268 tests passed |
| tokens        | `pnpm check:tokens`| 324 files, 0 violations |

## Test Coverage Summary

### Source-contract tests (vitest)
- `worldbuild-pipeline-runner.test.ts` — 14 tests (was 11, +3 new)
- `worldbuild-stage-runtime-state.test.ts` — 18 tests (was 16, +2 new)
- `worldbuild-checkpoint-staging.test.ts` — 18 tests
- `worldbuild-checkpoint-queue.test.ts` — 13 tests
- `worldbuild-artifact-review-detail.test.ts` — 11 tests
- `worldbuild-checkpoint-decision-flow.test.ts` — 15 tests (was 13, +2 new)
- Total plan-028 source-contract tests: **89**

### E2E specs (Playwright)
- `hierarchical-pipeline-traversal.spec.ts` — 2 tests (hierarchy rendering, stage selection)
- `hierarchical-pipeline-run-and-review.spec.ts` — 2 tests (lifecycle flow, multi-queue)
- `hierarchical-pipeline-failure-handling.spec.ts` — 3 tests (reject validation, invalid transition, no-canon-draft)

## Files Created
- `tests/e2e/hierarchical-pipeline-traversal.spec.ts`
- `tests/e2e/hierarchical-pipeline-run-and-review.spec.ts`
- `tests/e2e/hierarchical-pipeline-failure-handling.spec.ts`

## Files Updated
- `tests/outline/worldbuild-pipeline-runner.test.ts`
- `tests/outline/worldbuild-stage-runtime-state.test.ts`
- `tests/outline/worldbuild-checkpoint-decision-flow.test.ts`
