# Part Checklist

## Implementation

- [x] `.hero-banner` adds `background-image` candle radial gradient
- [x] `.hero-banner` adds `overflow: hidden` so the rule clips cleanly
- [x] `.hero-banner::before` renders the candle-dim left rule
- [x] `.hero-label` retuned to 9px / 0.18em / semibold uppercase in
      `--color-candle`

## Post-Implementation

- [x] `pnpm check:tokens` clean
- [x] `pnpm check` clean
- [x] `pnpm lint` clean
- [x] `pnpm lint:css` clean
- [x] `pnpm test` 1059/1059 passing
- [ ] Per-project mood engine deliberately NOT introduced (out of V1
      scope per [plan.md](../../../plan.md) Scope)
- [ ] Other library modules (Library cards row, Settings, Outline,
      Continuity, World-Building, Onboarding) — separate phases under
      this stage
