# Test Suite and Regression Evidence (2026-05-27)

## Files changed
- `dev-docs/plans/plan-030-nova-production-refactor/checklist.md`
- `dev-docs/plans/plan-030-nova-production-refactor/stage-004-verification-docs-closeout/checklist.md`
- `dev-docs/plans/plan-030-nova-production-refactor/stage-004-verification-docs-closeout/phase-001-test-suite-and-regression-evidence/phase.md`
- `dev-docs/plans/plan-030-nova-production-refactor/stage-004-verification-docs-closeout/phase-001-test-suite-and-regression-evidence/checklist.md`
- `dev-docs/plans/plan-030-nova-production-refactor/stage-004-verification-docs-closeout/phase-001-test-suite-and-regression-evidence/part-001-unit-service-tests.md`
- `dev-docs/plans/plan-030-nova-production-refactor/stage-004-verification-docs-closeout/phase-001-test-suite-and-regression-evidence/part-002-component-and-visual-tests.md`
- `dev-docs/plans/plan-030-nova-production-refactor/stage-004-verification-docs-closeout/phase-001-test-suite-and-regression-evidence/part-003-source-contract-tests.md`

## Commands run
- `pnpm exec vitest run tests/ai tests/nova`
- `pnpm exec playwright test tests/visual/editor-nova-panel.test.ts tests/visual/editor-nova-panel-conversation.test.ts tests/visual/editor-nova-panel-tools.test.ts`
- `pnpm exec vitest run tests/nova/nova-artifact-cards.test.ts tests/nova/nova-surface-reconciliation.test.ts tests/ai/pipeline/contracts.test.ts`

## Test results
- Unit/service regression run: `46` files / `363` tests passing.
- Targeted visual run: `2` passed, `3` skipped.
- Source-contract subset: `3` files / `15` tests passing.

## Known limitations
- Three Playwright screenshot baselines remain intentionally skipped due existing stabilization TODO notes in:
  - `tests/visual/editor-nova-panel.test.ts`
  - `tests/visual/editor-nova-panel-conversation.test.ts`
  - `tests/visual/editor-nova-panel-tools.test.ts`
- Full closeout commands (`pnpm run check`, lint suites, full `test`, full `test:visual`) remain pending for stage-004 phase-003.
