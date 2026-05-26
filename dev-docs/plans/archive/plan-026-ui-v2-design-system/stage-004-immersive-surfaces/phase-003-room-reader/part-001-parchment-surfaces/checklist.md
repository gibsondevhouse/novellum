# Part Checklist

## Implementation

- [x] `BookPage.svelte` background swapped to `--color-parchment`
- [x] `BookPage.svelte` text colour swapped to `--color-ink`
- [x] `BookPage.svelte` rebinds `--color-text-*` to ink tokens locally
- [x] `BookPage.svelte` border swapped to `--color-parchment-deep`
- [x] `BookPage.svelte` cover-fallback uses `--color-parchment-edge`
- [x] `ClassicReaderView.svelte` shell wraps in parchment + ink
- [x] `ClassicReaderView.svelte` rebinds `--color-text-*` and
      `--color-border-subtle` to parchment/ink tokens
- [x] `ClassicReaderView.svelte` scene card recoloured to a soft
      parchment ivory

## Post-Implementation

- [x] `pnpm check:tokens` clean
- [x] `pnpm check` clean
- [x] `pnpm lint` clean
- [x] `pnpm lint:css` clean
- [x] `pnpm test` 1059/1059 passing
- [ ] Ornament / DropCap integration (next part under this phase)
- [ ] Red ribbon, folio numbers, candle vignette (next part)
- [ ] BookSpread gutter recolour for parchment (next part)
- [ ] Visual regression baselines reviewed (Stage 006)
