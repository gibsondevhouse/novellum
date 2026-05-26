# Part Checklist

## Implementation

- [x] `.editor-host` `font-family` swapped to `var(--editor-prose-font)`
- [x] `h1` / `h2` swapped to `var(--font-display)` / `--font-weight-normal`
      / `--tracking-tight`
- [x] Caret recoloured from `--color-nova-blue` to `--color-candle`

## Post-Implementation

- [x] `pnpm check:tokens` clean
- [x] `pnpm check` clean
- [x] `pnpm lint` clean
- [x] `pnpm lint:css` clean
- [x] `pnpm test` 1059/1059 passing
- [ ] Visual regression baselines reviewed (deferred to Stage 006)
