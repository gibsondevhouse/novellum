# Impl Log — PillNav + Pickers

> Append-only.

## 2026-05-24

- `src/lib/components/ui/PillNav.svelte`: `.pill-nav__btn.active`
  recoloured with `color-mix(in srgb, var(--color-candle) 14%,
  var(--color-surface-elevated))` background, `var(--color-candle)`
  text, and a `0 0 0 1px color-mix(brass 25%)` inset rule on top of
  the existing `--shadow-sm`.
- `routes/settings/appearance/+page.svelte`:
  - `.appearance__title` → `var(--font-display)` /
    `var(--font-weight-normal)`.
  - `.appearance__heading` → 9px / 600 / 0.18em / uppercase /
    `var(--color-brass)`.
  - `.picker__pill:focus-visible` outline → `var(--color-border-focus)`.
  - `.picker__pill--active` → candle-tinted background, brass-blended
    border, candle text.
- `routes/settings/defaults/+page.svelte`: same picker recipe as
  appearance.
- `routes/settings/data/+page.svelte`: `.status-badge.migrating`
  recoloured to `var(--color-info)` (semantic), dropping the
  `--color-nova-blue` reference.
- Gates green:
  - `pnpm check:tokens` → 322 / 0.
  - `pnpm check` → 0 / 0.
  - `pnpm lint`, `pnpm lint:css` clean.
  - `pnpm test` → 1059 / 1059 passed.
