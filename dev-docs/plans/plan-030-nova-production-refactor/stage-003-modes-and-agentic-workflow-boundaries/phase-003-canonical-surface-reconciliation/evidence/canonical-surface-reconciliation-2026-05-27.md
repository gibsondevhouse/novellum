# Canonical Surface Reconciliation Evidence (2026-05-27)

## Files changed
- `dev-docs/04-modules/nova.md`
- `src/routes/nova/+page.svelte`
- `tests/nova/nova-surface-reconciliation.test.ts`

## Behavior delivered
- Nova module docs explicitly mark the embedded editor sidepanel as canonical for plan-030 and call out `/nova` as deferred legacy.
- `/nova` now renders an explicit in-route legacy-status notice to prevent silent divergence from sidepanel behavior.
- Reconciliation tests enforce that:
  - docs continue describing canonical/deferred ownership,
  - `/nova` keeps legacy `ChatInterface` backing,
  - route does not silently import sidepanel runtime modules,
  - deferred route remains interactive and mode-aware.

## Commands run
- `pnpm exec vitest run tests/nova/nova-surface-reconciliation.test.ts`
- `pnpm exec vitest run tests/nova/nova-panel.test.ts tests/nova/nova-panel-chat.test.ts tests/nova/nova-panel-error.test.ts tests/nova/nova-panel-tools.test.ts tests/nova/chat-service.test.ts tests/ai/prompt-builder.test.ts tests/nova/nova-artifact-cards.test.ts tests/nova/nova-surface-reconciliation.test.ts`

## Test results
- `1` file / `4` tests passing.
- Stage-003 targeted regression set: `8` files / `58` tests passing.

## Known limitations
- `/nova` remains a deferred legacy fullscreen surface and is not yet migrated to sidepanel runtime primitives.
- Stage-004 quality-gate commands (`check`, lint suites, full tests, visual aggregate) are still pending.
