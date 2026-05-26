# Part Checklist

## Pre-Implementation

- [x] Plan reviewed and approved
- [x] Token delta between current `src/styles/tokens.css` and v2 kit catalogued
- [x] CSP `font-src` confirmed to allow `https://fonts.gstatic.com`
- [x] `scripts/check-visual-tokens.mjs` confirmed to skip `novellum-docs/`

## Implementation

- [x] Surface ramp retuned to v2 warm umber (`#0f0d0a → #181410 → #221d17 →
      #2c241c → #382e23`)
- [x] HSL aliases updated to umber hues
- [x] Added `--color-candle`, `--color-candle-dim`, `--color-candle-deep`,
      `--color-brass`, `--color-ember`
- [x] Added `--color-parchment`, `--color-parchment-edge`,
      `--color-parchment-deep`
- [x] Added `--color-ink`, `--color-ink-soft`, `--color-ink-mute`
- [x] Added mood slots: `--mood-ink`, `--mood-wash`, `--mood-warm`,
      `--mood-accent` with neutral fallbacks
- [x] Added `--font-prose: 'Crimson Pro', ...`
- [x] Added `--header-height: 52px`
- [x] Sidebar widths set to `--sidebar-width: 208px`,
      `--sidebar-collapsed-width: 56px`
- [x] `--reader-prose-font` and `--editor-prose-font` wired to `--font-prose`
- [x] `src/app.html` Google Fonts URL extended to load Crimson Pro + Inter

## Post-Implementation

- [x] `pnpm check:tokens` clean (322 files, 0 violations)
- [x] `pnpm check` clean (0 errors, 0 warnings)
- [x] `pnpm lint` clean
- [x] `pnpm lint:css` clean (fixed pre-existing
      `SettingsMarkdownDocument.svelte` font-family quotes)
- [x] `pnpm test` clean (1059/1059 after `pnpm rebuild better-sqlite3`)
- [x] Evidence captured in `evidence/`
- [x] Final entry appended to `impl.log.md`
