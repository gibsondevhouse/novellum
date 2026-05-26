# Implementation Log

> Append-only.

## 2026-05-24 — Stylist Agent — reader on parchment

- `src/modules/reader/components/BookPage.svelte`:
  - `.book-page` background → `--color-parchment`, colour → `--color-ink`,
    border → `--color-parchment-deep`.
  - Locally rebinds `--color-text-primary` → `--color-ink`,
    `--color-text-secondary` → `--color-ink-soft`,
    `--color-text-muted` → `--color-ink-mute` so every descendant
    (titles, eyebrows, body, footer) renders in ink without per-rule
    edits.
  - Cover fallback recoloured to `--color-parchment-edge`.
- `src/modules/reader/components/ClassicReaderView.svelte`:
  - `.reader-shell` wrapped in `--color-parchment` + `--color-ink` with
    matching local rebind of text + border-subtle tokens.
  - Scene card background swapped from `--color-surface-raised` to a
    `color-mix` of parchment + parchment-edge (soft ivory) with
    `--color-parchment-deep` border.

### Gate results

- `pnpm check:tokens` — clean.
- `pnpm check` — 0/0.
- `pnpm lint` / `pnpm lint:css` — clean.
- `pnpm test` — 1059/1059.

### Follow-ups

- Ornament / DropCap integration, red ribbon, folio numbers, candle
  vignette, BookSpread gutter recolour scheduled as later parts of this
  phase. None blocking.
