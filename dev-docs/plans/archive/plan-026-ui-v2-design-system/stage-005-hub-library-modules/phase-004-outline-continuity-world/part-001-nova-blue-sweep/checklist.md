# Checklist — Nova-blue Sweep

## Pre-implementation

- [x] `grep_search` confirmed only 5 module files reference
      `--color-nova-blue` (outline ×3, world-building ×2). Route-level
      `world-building/+page.svelte` deferred.

## Implementation

- [x] `OutlineDetailCard.svelte`: scene accent + `.type-badge--scene` +
      `.btn-editor:hover` retokened.
- [x] `AddChapterForm.svelte`: focus border → `--color-border-focus`.
- [x] `ArcTagHint.svelte`: pill recoloured candle / brass.
- [x] `NarrativeStatePanel.svelte`: focus border → `--color-border-focus`.
- [x] `CharacterForm.svelte`: focus border → `--color-border-focus`.

## Gates

- [x] `pnpm check:tokens` — 322/0
- [x] `pnpm check` — 0/0
- [x] `pnpm lint`
- [x] `pnpm lint:css`
- [x] `pnpm test` — 1059/1059
