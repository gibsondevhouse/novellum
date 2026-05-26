# Stage-002 Implementation Log — Appearance Category

Status: complete
Owner: Stylist Agent
Date: 2026-05-03

## Decision Log

### 1. Default values

`fontSize = 'default'` (16px, `var(--text-base)`) and `lineSpacing = 'relaxed'` (1.75, `var(--leading-relaxed)`). These match the editor's pre-stage visual exactly — no regression on first load. The defaults are also the values applied to `--editor-font-size` / `--editor-line-height` directly in `tokens.css`, so the editor renders correctly even before the store hydrates and before the user has ever opened settings.

### 2. Store location

`src/lib/stores/appearance.svelte.ts` — under `$lib/stores/`, **not** `$modules/settings/stores`. The eslint-plugin-boundaries config already permits `module-editor → lib`, and plan-023 stage-007 will need to consume `appearance.fontSize` / `appearance.lineSpacing` from the editor pane. Placing the store under `module-settings` would force a forbidden cross-module import. Mirrors the existing pattern of `reader-mode.svelte.ts` and `model-selection.svelte.ts`.

### 3. Picker primitive

Custom `<button role="radio" aria-checked>` inside a `<div role="radiogroup" aria-labelledby="…">` rather than `PillToolbar` or a raw `GhostButton` group.

- `PillToolbar` is icon-required (its `PillToolbarButtonItem` type mandates an `icon` field) and carries roving-tabindex + dropdown-menu semantics that don't fit a single-select three-step picker. Its `aria-pressed` toggle-button semantics are also weaker for this use case than radiogroup semantics.
- Raw `GhostButton` group lacks group semantics; screen readers would announce three independent toggle buttons rather than a single "X of 3" radio group.
- `role="radiogroup"` with `role="radio"` + `aria-checked` is the canonical WAI-ARIA pattern for single-select pickers and matches the spec's preferred option. One consistent pattern is used across both pickers (font size and line spacing).

Labels are text-only — no emojis or icons in the pills (the existing `ThemeSelector` keeps its emoji glyphs as-is, since it's mounted unchanged). Each pill carries a small monospaced hint (`15px`, `1.25`, etc.) under the label so the value of each step is concrete; the hint is `aria-hidden="true"` because the visible label is sufficient for assistive tech.

### 4. Token defaults

`src/styles/tokens.css` declares the two new tokens inside the existing `:root` block, immediately after the editor page-geometry group:

```css
--editor-font-size: var(--text-base); /* 16px */
--editor-line-height: var(--leading-relaxed); /* 1.75 */
```

Both tokens reference existing scale tokens (`--text-*` / `--leading-*`) — no hardcoded values. The store overrides them at the `<html>` level via `documentElement.style.setProperty`, which takes precedence over the `:root` declaration, so the user's saved preference always wins after hydration.

### 5. Visual baseline strategy

**Regenerated `tests/visual/__screenshots__/visual/settings-shell.test.ts/settings-shell.png`** in place rather than splitting into a new `settings-appearance.png`. Rationale:

- The framing of the `settings-shell.test.ts` test is already `/settings/appearance` at 1280×800 — the route, viewport, and chrome are unchanged; only the panel body content evolves from placeholder to real content.
- A separate `settings-appearance.png` would duplicate the shell chrome (sidebar, header, PillNav) and create two baselines that drift in the same way for any future shell change.
- Visual count stays at 21/21 (no new visual file added). Any future per-section visual baseline (e.g., `settings-appearance-pickers.png`) can be added once the picker design stabilises across more categories.

**Regeneration command** (run with the dev server up at `:5173`):

```bash
pnpm exec playwright test tests/visual/settings-shell.test.ts --update-snapshots
```

Note: `--update-snapshots` only rewrites the baseline when the comparison fails. If the existing baseline still matches under the 1% pixel-ratio tolerance, Playwright leaves the file untouched. To force a clean regen, delete the PNG first:

```bash
rm tests/visual/__screenshots__/visual/settings-shell.test.ts/settings-shell.png
pnpm exec playwright test tests/visual/settings-shell.test.ts --update-snapshots
```

This was the path taken; the new baseline (85,862 bytes) shows the real Theme + Editor Text Size pills + start of Editor Line Spacing within the 1280×800 frame.

## Quality Gates

| Gate | Result | Notes |
| --- | --- | --- |
| `pnpm run lint` | ✅ 0 errors | Boundaries clean. Single pre-existing warning in `tests/nova/chat-service.test.ts` (unrelated). |
| `pnpm run check` | ⚠️ 3 errors, all pre-existing in `tests/settings/settings-layout.test.ts` (stage-001 untracked file) | Verified by `git stash` baseline comparison: my changes introduce **0** new check errors. The 3 errors are SvelteKit 2 branded-`page.url` type strictness in stage-001's layout test — to be addressed in a follow-up stage-001 fix, not stage-002 scope. |
| `pnpm run test` | ✅ 755/755 (was 743 pre-stage; +12 from new tests — 7 store + 5 page) | |
| `pnpm run test:visual` | ✅ 21/21 | `settings-shell.png` regenerated. |
| `node scripts/check-visual-tokens.mjs` | ✅ 0 violations from stage-002 files | Pre-existing violations in `ApiSettings.svelte` and `KeyValueDialog` are out of scope. |

## Deliverables

### Created

- `src/lib/stores/appearance.svelte.ts` — singleton store, `hydrate()` / `setFontSize()` / `setLineSpacing()`. SSR-safe.
- `tests/settings/appearance-store.test.ts` — 7 unit tests covering defaults, hydration, both setters, and the full token-mapping table.
- `tests/settings/appearance-page.test.ts` — 5 component tests covering subsection structure, ThemeSelector mount, both pickers' `aria-checked` toggling, and persistence calls.
- `tests/settings/fixtures/theme-selector-stub.svelte` — minimal stub used by the page test to avoid pulling `themeService` + `matchMedia` into the appearance page's render path.

### Modified

- `src/styles/tokens.css` — added `--editor-font-size` and `--editor-line-height` (defaults: `var(--text-base)`, `var(--leading-relaxed)`) under a new "Editor typography" comment block referencing plan-022 stage-002 and the plan-023 stage-007 consumer.
- `src/routes/settings/appearance/+page.svelte` — replaced the stage-001 placeholder with three subsections (Theme / Editor Text Size / Editor Line Spacing). `onMount` calls `appearance.hydrate()`. All visual properties source from design tokens; no hardcoded values.
- `tests/visual/__screenshots__/visual/settings-shell.test.ts/settings-shell.png` — baseline regenerated against the real Appearance content.

### Not Modified (per spec constraints)

- `src/modules/settings/components/ThemeSelector.svelte` — mounted as-is.
- `src/modules/settings/services/themeService.ts` — untouched.
- `tests/visual/settings-shell.test.ts` — same test file, regenerated baseline.

## Deviations from Spec

None. All five required decisions are recorded above; defaults, store location, token names, picker primitive, and baseline strategy match the spec's allowed options.

## Plan-023 Stage-007 Handoff

The two CSS variables `--editor-font-size` and `--editor-line-height` are now bound on `<html>` whenever the user has visited `/settings/appearance` at least once (and on every subsequent page load via `appearance.hydrate()`). Plan-023 stage-007 should:

1. In the editor pane's prose container, set `font-size: var(--editor-font-size)` and `line-height: var(--editor-line-height)`.
2. Optionally call `appearance.hydrate()` in the editor route's `onMount` as a defensive measure if the user can deep-link directly to the editor without ever opening settings (the singleton's idempotent and cheap to re-hydrate).
3. Reference the store's reactive fields (`appearance.fontSize`, `appearance.lineSpacing`) only if live preview *outside* of CSS variable binding is needed — for the pure CSS-var path, no JS subscription is required.
