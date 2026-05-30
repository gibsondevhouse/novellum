# Attachment Decision and Mode Legibility Evidence (2026-05-27)

## Files changed
- `src/modules/nova/components/NovaComposer.svelte`
- `tests/nova/nova-panel.test.ts`
- `tests/nova/nova-panel-chat.test.ts`

## Decision recorded
- **Decision:** remove attachment upload/staging affordances in plan-030 stage-002.
- **Rationale:** attachments were only locally staged and never sent to model context, creating a fake affordance.
- **Outcome:** upload button/input/chips removed until a real ingestion path is implemented.

## Behavior delivered
- Mode selector now uses explicit `Chat` / `Scribe` labels instead of single-letter shorthand.
- Mode selector tooltip exposes the selected mode description.
- Streaming state clearly disables mode selector and textarea while Stop action is visible.

## Commands run
- `pnpm exec vitest run tests/nova/nova-panel.test.ts tests/nova/nova-panel-chat.test.ts tests/nova/nova-panel-error.test.ts tests/nova/nova-panel-tools.test.ts`

## Test results
- `4` files / `22` tests passing.

## Known limitations
- Visual composer baseline work (phase-003 part-003) is still pending.
- Playwright snapshot specs under `tests/visual/editor-nova-panel*.test.ts` remain skipped due existing CI render-stability TODO.
