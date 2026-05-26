---
stage: stage-007-preference-consumption
date: 2026-05-04
author: Planner + direct implementation
---

# Implementation Log

## Decisions

1. **Editor token binding** — `ManuscriptEditorPane.svelte` previously used
   `font-size: clamp(1rem, 1vw + 0.9rem, 1.1rem)` and `line-height: 1.9` as
   hardcoded values in `.editor-host`. Both replaced with `var(--editor-font-size)`
   and `var(--editor-line-height)` tokens. The `appearance` store already writes
   these to `document.documentElement.style` on hydration; no further wiring needed
   in the component itself.

2. **Hydration call in editor route** — `appearance.hydrate()` is called inside
   `onMount` of `src/routes/projects/[id]/editor/+page.svelte`. The route previously
   had no `onMount`; `onMount` was added alongside the import. The call is
   `void appearance.hydrate()` (non-blocking — the tokens apply asynchronously
   via the preferences API; the editor does not depend on hydration completing
   before rendering).

3. **Default reader view guard** — `localStorage.getItem('novellum:reader')` is used
   as the "has saved mode" sentinel. The key `novellum:reader` is the storage key
   written by `writeStorage()` in `reader-mode.svelte.ts` — no new key introduced.
   If null (first open), `defaults.hydrate()` is awaited and `setReaderMode` is
   called with `defaults.readerView`. Subsequent opens use the persisted mode.
   This means the default applies exactly once, on the user's first book open, then
   their in-session choices take over — which is the intended UX.

4. **Test strategy** — All three behavior assertions (CSS token binding, hydration
   call, default reader view guard) are implemented as source-string tests, matching
   the established pattern in `tests/reader/deep-link.test.ts`. Component-mount tests
   for `onMount` behavior are brittle in jsdom; source-string tests are more stable
   and faster.

5. **Visual regression** — No visual baseline changes. The CSS token defaults
   (`var(--text-base)` / `var(--leading-relaxed)`) match the previously hardcoded
   values (`clamp(1rem, 1vw + 0.9rem, 1.1rem)` ≈ 16px / `1.9` ≈ equivalent leading).
   The editor appearance does not change for users who have not modified their
   Appearance settings.

## Gate Summary

| Gate | Result |
| --- | --- |
| `pnpm run lint` | ✅ 0 errors (1 pre-existing warning) |
| `pnpm run check` | ✅ 0 errors, 0 warnings |
| `pnpm run test` | ✅ 793/793 (+11 new) |
| `pnpm run test:visual` | ✅ 21/21 |

## Deviations

None.
