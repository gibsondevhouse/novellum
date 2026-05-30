# Header Identity and Status Evidence (2026-05-27)

## Files changed
- `src/modules/nova/components/NovaPanel.svelte`
- `tests/nova/nova-panel.test.ts`

## Behavior delivered
- Header now renders explicit Nova identity (`Nova`) with a compact live status line.
- Close action remains accessible via `aria-label="Close Nova"`.
- Context/model tray remains discoverable with explicit `aria-label="Context and model controls"`.
- Resize handle label updated to `Resize Nova panel` for naming consistency.

## Commands run
- `pnpm exec vitest run tests/nova/nova-panel.test.ts tests/nova/nova-panel-chat.test.ts`

## Test results
- `2` files / `10` tests passing.

## Known limitations
- Remaining phase-001 work (responsive width states and focus/keyboard polish) is still pending.
