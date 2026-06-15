# Full E2E Run Evidence

Date: 2026-06-12
Agent: Codex
Plan: plan-046-pipeline-checkpoint-contract-reconciliation
Stage: stage-004-full-e2e-closure
Phase: phase-001-full-e2e-run
Part: part-001-full-e2e-run

## Command

```bash
pnpm test:e2e --project=chromium
```

## Result

- Exit code: 0
- Browser project: Chromium
- Tests: 19 passed
- Duration: 7.7s

## Relevant Passing Coverage

- `hierarchical-pipeline-failure-handling.spec.ts`: 3 tests passed.
- `hierarchical-pipeline-run-and-review.spec.ts`: 2 tests passed.
- `vibe-worldbuild-checkpoints.spec.ts`: 2 tests passed.
- `vibe-author-review-gates.spec.ts`: 1 test passed.
- `outline-generation-review.spec.ts`: 2 tests passed.

## Notes

The four Stage 001 stale fixture failures are resolved. The run still emitted
Playwright web-server color warnings, but they did not affect test execution.
