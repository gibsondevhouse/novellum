# Streaming, Aborted, and Error Recovery Evidence (2026-05-27)

## Files changed
- `tests/nova/nova-panel-chat.test.ts`

## Behavior delivered
- Added retry regression test proving failed assistant turns are removed before retry.
- Verified retry reuses the prior user prompt with `skipUserAppend: true` to prevent duplicate user turns.
- Existing aborted-state behavior remains covered (partial content retained with explicit aborted status).

## Commands run
- `pnpm exec vitest run tests/nova/nova-panel.test.ts tests/nova/nova-panel-chat.test.ts tests/nova/nova-panel-error.test.ts tests/nova/nova-panel-tools.test.ts`

## Test results
- `4` files / `21` tests passing.

## Known limitations
- Phase-003 (composer affordance truthfulness) is still pending in stage-002.
- Playwright snapshot specs under `tests/visual/editor-nova-panel*.test.ts` remain skipped due existing CI render-stability TODO.
