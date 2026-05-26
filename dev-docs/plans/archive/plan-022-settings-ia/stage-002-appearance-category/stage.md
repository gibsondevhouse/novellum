---
title: Appearance Category
slug: stage-002-appearance-category
stage_number: 2
status: complete
owner: Stylist Agent
plan: plan-022-settings-ia
phases:
  - phase-001-theme-relocation
  - phase-002-editor-text-size
  - phase-003-editor-line-spacing
  - phase-004-tests
estimated_duration: 1d
risk_level: low
---

## Goal

Ship the Appearance settings panel: theme (relocated from existing `ThemeSelector`), editor text size, editor line spacing. Each value persists via the existing preferences service and applies live by binding CSS custom properties on `<html>`. Plan-023 stage-007 reads these same custom properties.

## Context (already in tree — do not duplicate)

- `src/modules/settings/components/ThemeSelector.svelte` already implements the theme picker (Light / Dark / System) writing through `themeService.storeTheme()` (mirrors to SQLite via `setPreference('app.theme', …)`) and `applyTheme()` (sets `data-theme` attribute on `<html>`).
- `src/lib/preferences.ts` — async client. SSR-safe. `getPreference<T>(key, default)`, `setPreference<T>(key, value)`.
- `src/styles/tokens.css` already exposes typography tokens: `--text-xs|sm|base|lg|xl|2xl|...|6xl` and leading tokens `--leading-tight|normal|relaxed`. Reader already binds `--reader-prose-size` and `--reader-prose-leading`.
- Stage-001 placeholder lives at `src/routes/settings/appearance/+page.svelte`. Replace its body in this stage.

## Exit Criteria

- `/settings/appearance` renders three subsections: Theme, Editor Text Size, Editor Line Spacing.
- **Theme** subsection mounts the existing `<ThemeSelector />` (no behavior change).
- **Editor Text Size:**
  - Three-step pill control: Small (15px), Default (16px), Large (18px). Active state via `aria-pressed`.
  - Persists `app.editor.fontSize` (string: `'small' | 'default' | 'large'`).
  - On mount and on change, sets the CSS custom property `--editor-font-size` on `document.documentElement` to the corresponding token (`var(--text-sm)`, `var(--text-base)`, `var(--text-lg)`).
- **Editor Line Spacing:**
  - Three-step pill control: Tight, Normal, Relaxed. `aria-pressed` for active.
  - Persists `app.editor.lineSpacing` (string: `'tight' | 'normal' | 'relaxed'`).
  - On mount and on change, sets `--editor-line-height` on `document.documentElement` to `var(--leading-tight)`, `var(--leading-normal)`, or `var(--leading-relaxed)`.
- Both new tokens (`--editor-font-size`, `--editor-line-height`) are declared in `src/styles/tokens.css` with sensible defaults (`var(--text-base)` and `var(--leading-relaxed)` respectively).
- A new client store `src/lib/stores/appearance.svelte.ts` exposes the reactive values and the side-effecting setters (mirrors the pattern of `reader-mode.svelte.ts`).
- Plan-023 editor pane consumes these tokens (wiring is plan-023 stage-007's job; this stage only ships the tokens + persistence + setters).
- All quality gates green: `pnpm run lint`, `pnpm run check`, `pnpm run test` (~755+), `pnpm run test:visual` (regen `settings-shell.png` only if framing changed; new baseline for `/settings/appearance` content).

## Phases

### Phase-001 — Theme relocation

- Replace `src/routes/settings/appearance/+page.svelte` body. Keep `<svelte:head>` and the page heading (`<h1>Appearance</h1>`); under it render three subsections (`<section aria-labelledby="…">`).
- First subsection: `<ThemeSelector />` from `$modules/settings`. No wrapper besides a `<h2 id="appearance-theme-heading">Theme</h2>` and its `<section>`.

### Phase-002 — Editor Text Size

- Add tokens to `src/styles/tokens.css` under the typography group:

  ```css
  --editor-font-size: var(--text-base);   /* 16px default */
  --editor-line-height: var(--leading-relaxed); /* 1.75 default */
  ```

- Create `src/lib/stores/appearance.svelte.ts`:

  ```ts
  import { getPreference, setPreference } from '$lib/preferences.js';

  export type EditorFontSize = 'small' | 'default' | 'large';
  export type EditorLineSpacing = 'tight' | 'normal' | 'relaxed';

  const FONT_SIZE_KEY = 'app.editor.fontSize';
  const LINE_SPACING_KEY = 'app.editor.lineSpacing';

  const FONT_SIZE_TOKEN: Record<EditorFontSize, string> = {
    small: 'var(--text-sm)',
    default: 'var(--text-base)',
    large: 'var(--text-lg)',
  };
  const LINE_SPACING_TOKEN: Record<EditorLineSpacing, string> = {
    tight: 'var(--leading-tight)',
    normal: 'var(--leading-normal)',
    relaxed: 'var(--leading-relaxed)',
  };

  class AppearanceStore {
    fontSize = $state<EditorFontSize>('default');
    lineSpacing = $state<EditorLineSpacing>('relaxed');
    hydrated = $state(false);

    async hydrate(): Promise<void> {
      const [fs, ls] = await Promise.all([
        getPreference<EditorFontSize>(FONT_SIZE_KEY, 'default'),
        getPreference<EditorLineSpacing>(LINE_SPACING_KEY, 'relaxed'),
      ]);
      this.fontSize = fs;
      this.lineSpacing = ls;
      this.applyAll();
      this.hydrated = true;
    }

    setFontSize(value: EditorFontSize): void {
      this.fontSize = value;
      this.applyFontSize();
      void setPreference(FONT_SIZE_KEY, value);
    }

    setLineSpacing(value: EditorLineSpacing): void {
      this.lineSpacing = value;
      this.applyLineSpacing();
      void setPreference(LINE_SPACING_KEY, value);
    }

    private applyAll(): void {
      this.applyFontSize();
      this.applyLineSpacing();
    }

    private applyFontSize(): void {
      if (typeof document === 'undefined') return;
      document.documentElement.style.setProperty('--editor-font-size', FONT_SIZE_TOKEN[this.fontSize]);
    }

    private applyLineSpacing(): void {
      if (typeof document === 'undefined') return;
      document.documentElement.style.setProperty('--editor-line-height', LINE_SPACING_TOKEN[this.lineSpacing]);
    }
  }

  export const appearance = new AppearanceStore();
  ```

- In `src/routes/settings/appearance/+page.svelte`:
  - `onMount(() => { void appearance.hydrate(); });` once at the route level.
  - Render the Editor Text Size subsection: a `<SurfaceCard variant="flat">` with `<h2>Editor Text Size</h2>`, description, and three GhostButton pills. Buttons have `aria-pressed={appearance.fontSize === 'small'}` etc.

### Phase-003 — Editor Line Spacing

- Same `appearance/+page.svelte` file. Third subsection mirrors Phase-002's structure: SurfaceCard, three pills (Tight / Normal / Relaxed) calling `appearance.setLineSpacing(...)`.
- Token wiring is already done in `appearance.svelte.ts`.

### Phase-004 — Tests

- **Unit (vitest):**
  - `tests/settings/appearance-store.test.ts` (new) — `appearance.setFontSize('large')` writes to preferences mock + sets `documentElement.style['--editor-font-size']`. Same for line spacing. `hydrate()` reads from preferences mock and applies.
- **Component (vitest + Testing Library):**
  - `tests/settings/appearance-page.test.ts` (new) — renders `/settings/appearance` route page; clicking each pill flips `aria-pressed`. Mock the `appearance` store or stub `setPreference`.
- **Visual (Playwright):**
  - Update `tests/visual/settings-shell.test.ts` baseline (or add a new `tests/visual/settings-appearance.test.ts`) — record real Appearance content. Take 1280×800 baseline.
- **Quality gates:** lint / check / test / test:visual all clean.

## Decision Log Required

- Default values: `default` font size, `relaxed` line spacing — matches the current editor visual (which already uses `var(--text-base)` / `var(--leading-relaxed)`).
- Store location — `src/lib/stores/appearance.svelte.ts` (consumed by both settings UI and editor pane in plan-023 stage-007). Confirm `lib` placement is correct (not `module-settings`) since plan-023 will read it.
- Whether to reuse the existing `PillToolbar` primitive for the three-step pickers, or roll a simple GhostButton group. Spec defers to the Stylist's judgement; record final.
- Token defaults — `--editor-font-size: var(--text-base)`, `--editor-line-height: var(--leading-relaxed)`.
- How the existing `settings-shell.png` baseline is treated — regenerate (Appearance content now real), or split into `settings-appearance.png`.

## Out of Scope

- Editor pane *consumption* of the new tokens — plan-023 stage-007.
- Reader prose size/leading — already shipped via `--reader-prose-size`.
- Any other Appearance preferences (UI density, accent color, etc.) — out of scope for this plan.
- Server-side migration — `app_preferences` table already exists; new keys live alongside without schema changes.
