# Checklist — Routes + Nova + Editor Sweep

## Pre-implementation

- [x] Grep confirmed remaining `--color-nova-blue` callers
      (excluding `routes/styles/+page.svelte`).

## Implementation

- [x] world-building landing radial, CTA, lane index, lane entry link.
- [x] editor scene page radial + history hover.
- [x] SceneEditorFrame caret colour.
- [x] EditorShell `.meter-fill` candle/brass blend.
- [x] SceneSignalNudge nova button + hover.
- [x] NovaMessageLog error link.
- [x] NovaComposer send button.

## Gates

- [x] `pnpm check:tokens` — 322/0
- [x] `pnpm check` — 0/0
- [x] `pnpm lint`
- [x] `pnpm lint:css`
- [x] `pnpm test` — 1059/1059
