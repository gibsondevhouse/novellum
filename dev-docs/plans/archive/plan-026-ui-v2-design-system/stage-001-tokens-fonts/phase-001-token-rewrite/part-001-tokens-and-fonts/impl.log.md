# Implementation Log

> Append-only. Never edit or delete existing entries.

## 2026-05-24 — Stylist Agent — token rewrite landed

- Retuned `src/styles/tokens.css` dark surface ramp to v2 warm umber:
  `--color-surface-base: #0f0d0a`, `-ground: #181410`, `-raised: #221d17`,
  `-overlay: #2c241c`, `-elevated: #382e23`, `-hover: #2a2218`. HSL aliases
  updated to matching umber hues.
- Added editorial palette: `--color-candle`, `--color-candle-dim`,
  `--color-candle-deep`, `--color-brass`, `--color-ember`,
  `--color-parchment*`, `--color-ink*`.
- Reserved mood slots (`--mood-ink`, `--mood-wash`, `--mood-warm`,
  `--mood-accent`) with neutral fallbacks pointing at existing tokens —
  no per-project mood engine wired in this plan.
- Added `--font-prose: 'Crimson Pro', 'Iowan Old Style', Georgia, serif`.
  Wired `--reader-prose-font` and `--editor-prose-font` to consume it.
- Added `--header-height: 52px`. Updated sidebar widths to v2:
  `--sidebar-width: 208px`, `--sidebar-collapsed-width: 56px`.
- Extended `src/app.html` Google Fonts URL to load Crimson Pro
  (ital,wght 0/1 × 400/500/600 — italic 600 dropped) and Inter
  (400;500;600;700) alongside DM Serif Display.
- Verified CSP in `src/hooks.server.ts` already permits
  `https://fonts.gstatic.com` under `font-src`. No CSP change required.
- Drive-by: fixed pre-existing stylelint error in
  `src/lib/components/settings/SettingsMarkdownDocument.svelte` — replaced
  `'SF Mono', 'Monaco', 'Consolas', monospace` with `var(--font-mono)` so
  `pnpm lint:css` passes.
- Drive-by: ran `pnpm rebuild better-sqlite3` to resolve
  `NODE_MODULE_VERSION 141 vs 127` ABI mismatch that was blocking the
  Vitest sqlite suites. Documented in stage notes for contributors.

### Gate results

- `pnpm check:tokens` — 322 files, 0 violations.
- `pnpm check` — 0 errors / 0 warnings.
- `pnpm lint` — clean.
- `pnpm lint:css` — clean.
- `pnpm test` — 1059 / 1059 passed.
- Playwright visual baselines NOT regenerated (deferred to Stage 006).

Part status → `complete`. Phase status → `complete`. Stage status → `complete`.
