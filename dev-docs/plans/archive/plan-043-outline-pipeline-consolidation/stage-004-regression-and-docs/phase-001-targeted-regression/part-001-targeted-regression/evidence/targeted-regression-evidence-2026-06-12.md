# Targeted Regression Evidence

Date: 2026-06-12

## Summary

Plan-043 regression gates passed after checkpoint routing, legacy card read-only conversion, and legacy route retirement.

## Targeted Test Runs

- `pnpm test tests/nova/nova-artifact-cards.test.ts tests/routes/nova-outline-apply-route.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-accept.test.ts`
  - Result: passed, 4 files / 20 tests.
- `pnpm test tests/nova/nova-artifact-cards.test.ts tests/routes/nova-outline-apply-route.test.ts tests/routes/outline-checkpoints.test.ts tests/routes/outline-accept.test.ts tests/nova/mode-routing.test.ts tests/nova/chat-service.test.ts tests/nova/outline-generation-state.test.ts`
  - Result: passed, 7 files / 52 tests.
- `pnpm test:e2e --grep "outline generation review gate" --project=chromium`
  - Result: passed, 2 tests.

## Full Quality Gates

- `pnpm check`
  - Result: passed, 0 errors / 0 warnings.
- `pnpm lint`
  - Result: passed.
- `pnpm lint:css`
  - Result: passed.
- `pnpm check:tokens`
  - Result: passed, 347 files scanned / 0 violations.
- `pnpm test`
  - Result: passed, 240 files / 1760 tests.

## Notes

- Playwright emitted only the known `NO_COLOR` / `FORCE_COLOR` warning from the web server process.
- No visual regression suite was run because this plan changed behavior and docs, not visual snapshots.
