# No-Key and Settings Consistency Evidence (2026-05-27)

## Files changed
- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaMessageLog.svelte`
- `tests/nova/nova-panel-error.test.ts`

## Behavior delivered
- Standardized missing-key links to `/settings/ai` in both empty-state and inline error surfaces.
- Updated no-key empty-state copy to point explicitly to AI Settings and Nova usage.
- Switched missing-key detection in message log from ad-hoc regex to `classifyNovaError(... ) === 'invalid_key'` for consistent error classification.

## Commands run
- `pnpm exec vitest run tests/nova/nova-panel.test.ts tests/nova/nova-panel-chat.test.ts tests/nova/nova-panel-error.test.ts tests/nova/nova-panel-tools.test.ts`

## Test results
- `4` files / `20` tests passing.

## Known limitations
- Phase-002 part-003 (streaming/aborted/error recovery) is still pending.
- Playwright snapshot specs under `tests/visual/editor-nova-panel*.test.ts` remain skipped due existing CI render-stability TODO.
