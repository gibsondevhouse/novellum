# Checklist — Cover Foil + Row Eyebrow

## Pre-implementation

- [x] Confirm tokens `--color-candle`, `--color-brass`,
      `--color-surface-elevated`, `--color-surface-base` exist.

## Implementation

- [x] Add `.cover-foil` overlay span inside `.cover-image` in
      `BookCoverCard.svelte`.
- [x] Swap hover shadow + border for candle glow + brass-tinted
      border.
- [x] Warm `.cover-placeholder` gradient with brass tint.
- [x] Re-token `.status-drafting` to candle.
- [x] Convert `.book-meta` to eyebrow micro-anatomy.
- [x] Add `.collection-eyebrow` above `.collection-title` in
      `CollectionRow.svelte`.

## Gates

- [x] `pnpm check:tokens` — 322/0
- [x] `pnpm check` — 0/0
- [x] `pnpm lint`
- [x] `pnpm lint:css`
- [x] `pnpm test` — 1059/1059
