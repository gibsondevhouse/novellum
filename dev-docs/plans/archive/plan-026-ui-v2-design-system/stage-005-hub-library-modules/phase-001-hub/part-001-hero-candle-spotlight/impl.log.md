# Implementation Log

> Append-only.

## 2026-05-24 — Stylist Agent — hub hero v2 spotlight

- `src/modules/project/components/HomeLibraryShell.svelte`:
  - `.hero-banner` made `position: relative`, `overflow: hidden`, and
    layered a radial `background-image`:
    `radial-gradient(ellipse 60% 60% at 18% 38%, color-mix(in srgb, var(--color-candle) 14%, transparent), transparent 70%)`.
  - Added `.hero-banner::before` as the candle-dim left rule
    (`linear-gradient(to bottom, transparent, color-mix(in srgb, var(--color-candle-dim) 55%, transparent), transparent)`),
    inset 12% top and bottom.
  - `.hero-label` swapped from `--text-sm` / wide-tracking / nova-blue /
    bold to the v2 eyebrow micro-anatomy: 9px, `0.18em`,
    `--font-weight-semibold`, `--color-candle`.

### Gate results

- `pnpm check:tokens` — clean.
- `pnpm check` — 0/0.
- `pnpm lint` / `pnpm lint:css` — clean.
- `pnpm test` — 1059/1059.
