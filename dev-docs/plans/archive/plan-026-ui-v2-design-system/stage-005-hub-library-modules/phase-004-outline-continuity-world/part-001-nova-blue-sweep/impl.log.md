# Impl Log — Nova-blue Sweep

## 2026-05-13

- Replaced nova-blue references in 5 module components:
  - `src/modules/outline/components/OutlineDetailCard.svelte`
    (scene accent, `.type-badge--scene`, `.btn-editor:hover`).
  - `src/modules/outline/components/AddChapterForm.svelte`
    (input focus border).
  - `src/modules/outline/components/ArcTagHint.svelte`
    (`.arc-pill` background + border + text colour).
  - `src/modules/world-building/components/NarrativeStatePanel.svelte`
    (`.input-inline:focus` border-color).
  - `src/modules/world-building/components/CharacterForm.svelte`
    (`.text-field__control:focus` border-color).
- Visual: scene accents now read warm candle, focus rings use the
  semantic `--color-border-focus`, arc tags carry a brass-edged
  candle wash.
- Gates: `pnpm check:tokens` 322/0, `pnpm check` 0/0, `pnpm lint`
  clean, `pnpm lint:css` clean, `pnpm test` 1059/1059.
- Deferred follow-ups (logged on phase.md): route-level
  `world-building/+page.svelte` AI accent panel, Continuity board
  cards, Story-Bible entity polish, and `editor/[sceneId]/+page.svelte`
  Muse accents (lives in a separate Phase 4 follow-up).
