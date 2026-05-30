# Context Disclosure Evidence (2026-05-27)

## Files changed
- `src/modules/nova/stores/nova-session.svelte.ts`
- `src/modules/nova/components/ContextDisclosurePill.svelte`
- `src/modules/nova/services/chat-service.ts`
- `tests/nova/context-disclosure-pill.test.ts`
- `tests/nova/nova-session.test.ts`
- `tests/nova/chat-service.test.ts`

## Implemented behavior
- Disclosure state now carries warnings and compressed/truncated flags.
- Pill now renders explicit states:
  - `Project attached`
  - `No context attached`
  - `Compressed`
  - `Trimmed`
- Warning text is exposed in pill title tooltip for transparency.
- Session clear now resets disclosure state to prevent stale status leakage.
- Project-dependent generation now hard-stops when no project is open.
- Generation requests now return focused corrective guidance when `logline`/`synopsis` are missing from project baseline.

## Commands run
- `pnpm exec vitest run tests/nova/context-disclosure-pill.test.ts tests/nova/nova-session.test.ts tests/nova/chat-service.test.ts`
- `pnpm run check`
- `pnpm run lint`
- `pnpm run lint:css`
- `pnpm run test`

## Known limitations
- `/nova` fullscreen surface remains deferred and still diverges from the sidepanel path.
