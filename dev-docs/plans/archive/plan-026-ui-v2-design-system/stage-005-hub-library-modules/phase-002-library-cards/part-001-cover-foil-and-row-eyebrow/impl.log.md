# Impl Log — Cover Foil + Row Eyebrow

> Append-only.

## 2026-05-24

- `BookCoverCard.svelte`:
  - Inserted a `.cover-foil` overlay span inside `.cover-image` using a
    candle-tinted radial highlight + 125° linear sheen via
    `color-mix`, with `mix-blend-mode: screen` and `opacity: 0.7`.
  - Hover state now layers `var(--shadow-md)` with a
    `0 0 24px color-mix(in srgb, var(--color-candle) 18%, transparent)`
    glow, and uses a brass-blended border (45% brass into
    `--color-border-strong`).
  - Placeholder gradient warmed: starts with 18% brass into
    `--color-surface-elevated`, fades to `--color-surface-base`.
  - `.status-drafting` re-tokened from teal to candle.
  - `.book-meta` now reads as an eyebrow (9px, semibold, 0.18em
    tracking, uppercase, muted ink).
- `CollectionRow.svelte`:
  - Wrapped `.collection-title` in a `.row-header__stack` flex column.
  - Added `.collection-eyebrow` ("Shelf", 9px semibold, 0.18em
    tracking, brass colour) above the title.
- Gates green:
  - `pnpm check:tokens` → 322 / 0.
  - `pnpm check` → 0 / 0.
  - `pnpm lint`, `pnpm lint:css` clean.
  - `pnpm test` → 1059 / 1059 passed.
