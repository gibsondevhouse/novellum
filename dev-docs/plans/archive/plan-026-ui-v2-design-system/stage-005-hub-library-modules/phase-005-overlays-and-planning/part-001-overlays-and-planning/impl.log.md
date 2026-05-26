# Impl Log — Overlays + Planning Sweep

## 2026-05-24

- AI overlay + suggestion card + rewrite modal primary buttons
  now render `var(--color-candle)` on `var(--color-ink)` with a
  brass-blended border. Hover blends the candle toward brass for a
  warm pressed state.
- Proofread mode badge moved off nova-blue onto candle to match
  the rest of the warm AI palette.
- Planning section labels (`StructuredSection.section-label`) and
  the planning surface context label adopt the canonical 9px /
  600 / 0.18em uppercase brass eyebrow, matching `EditorialEyebrow`
  and `PageHeader`.
- Gates: `pnpm check:tokens` 322/0, `pnpm check` 0/0, `pnpm lint`
  clean, `pnpm lint:css` clean, `pnpm test` 1059/1059.
