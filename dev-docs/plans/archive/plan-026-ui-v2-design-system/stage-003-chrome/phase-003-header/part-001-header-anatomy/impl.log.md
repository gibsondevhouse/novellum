# Implementation Log

> Append-only.

## 2026-05-24 — Architect Agent — header v2 anatomy landed

- `src/lib/components/AppHeader.svelte`:
  - Height bumped from 48px to `var(--header-height)` (52px).
  - Padding bumped to `--space-6` horizontally.
  - Added `displayEyebrow` derived rune mapping route → editorial label:
    `The Room` (reader), `The Page` (editor), `Workshop` (project),
    `Preferences` (settings), `The Muse` (nova), `Library` (books),
    `Assets` (images).
  - Restructured `.header-context` to render eyebrow + title in a vertical
    stack (`.header-context__stack`).
  - Title switched from `--text-sm` / sans-medium to
    `--font-display` (DM Serif Display) at `--text-lg` /
    `--font-weight-normal` / `--tracking-tight`.
  - Icon recoloured to `--color-brass`.
  - Added `.app-header::after` candle gradient underline accent
    (`color-mix(in srgb, var(--color-candle-dim) 30%, transparent)` mid-stop).
- `AppSidebar` 208/56 widths already picked up from the Stage 001 token
  shift — no code change needed.
- Lucide icon extraction and `SecondaryLeftSidebar` restyle deferred to
  follow-up phases under this stage (not blocking Stages 004/005).

### Gate results

- `pnpm check:tokens` — clean.
- `pnpm check` — clean.
- `pnpm lint` — clean.
- `pnpm lint:css` — clean.
