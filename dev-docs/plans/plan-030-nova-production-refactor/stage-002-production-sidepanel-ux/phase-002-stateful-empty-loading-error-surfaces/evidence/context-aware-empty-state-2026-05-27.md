# Context-Aware Empty State Evidence (2026-05-27)

## Files changed
- `src/modules/nova/components/NovaPanel.svelte`
- `tests/nova/nova-panel.test.ts`
- `tests/nova/nova-panel-chat.test.ts`

## Behavior delivered
- Empty-state guidance now differs by project context:
  - with `projectId`: project-grounded prompt language
  - without `projectId`: explicit no-project guidance
- Quick prompt affordance now renders only when it is actionable (`projectId` exists and `onQuickPrompt` callback is present).
- Default runtime path no longer shows a no-op quick prompt button.

## Commands run
- `pnpm exec vitest run tests/nova/nova-panel.test.ts tests/nova/nova-panel-chat.test.ts tests/nova/nova-panel-error.test.ts tests/nova/nova-panel-tools.test.ts`

## Test results
- `4` files / `20` tests passing.

## Known limitations
- Phase-002 part-002 and part-003 are still pending.
- Playwright snapshot specs under `tests/visual/editor-nova-panel*.test.ts` remain skipped due existing CI render-stability TODO.
