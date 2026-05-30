# Focus and Keyboard Polish Evidence (2026-05-27)

## Files changed
- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/editor/components/EditorToolbar.svelte`
- `tests/nova/nova-panel.test.ts`
- `tests/visual/editor-nova-panel.test.ts`
- `tests/visual/editor-nova-panel-conversation.test.ts`
- `tests/visual/editor-nova-panel-tools.test.ts`

## Behavior delivered
- Updated panel surface naming from `Nova copilot` to `Nova panel` for consistent product identity.
- Replaced user-facing composer labels/placeholders (`Copilot`) with `Nova`.
- Added keyboard-resize regression coverage for Arrow/Home/End behavior on the panel resize slider.
- Kept the composer interactive through responsive viewport states and preserved focus-visible behavior.

## Commands run
- `pnpm exec vitest run tests/nova/nova-panel.test.ts tests/nova/nova-panel-chat.test.ts tests/nova/nova-panel-error.test.ts tests/nova/nova-panel-tools.test.ts`

## Test results
- `4` files / `20` tests passing.

## Known limitations
- Playwright snapshot specs under `tests/visual/editor-nova-panel*.test.ts` remain skipped due existing CI render-stability TODO.
- Stage-002 phase-002 and phase-003 items remain open.
