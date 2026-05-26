# Checklist — PillNav + Pickers

## Pre-implementation

- [x] Confirm `PillNav` has no Vitest snapshot tests (only Playwright
      visual baselines under `tests/visual/settings-shell.test.ts`,
      which are deliberately deferred until Stage 006).
- [x] Confirm `--color-candle`, `--color-brass`,
      `--color-border-focus`, `--color-info` exist in tokens.

## Implementation

- [x] Recolour `PillNav.__btn.active` in
      `src/lib/components/ui/PillNav.svelte`.
- [x] Restyle `.appearance__title` (display font) and
      `.appearance__heading` (brass eyebrow) in
      `routes/settings/appearance/+page.svelte`.
- [x] Recolour `.picker__pill--active` and `.picker__pill:focus-visible`
      in appearance + defaults.
- [x] Remap `--color-nova-blue` → `--color-info` in
      `routes/settings/data/+page.svelte`.

## Gates

- [x] `pnpm check:tokens` — 322/0
- [x] `pnpm check` — 0/0
- [x] `pnpm lint`
- [x] `pnpm lint:css`
- [x] `pnpm test` — 1059/1059
