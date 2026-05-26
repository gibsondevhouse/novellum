---
title: Settings Shell & PillNav
slug: stage-001-settings-shell-and-pillnav
stage_number: 1
status: complete
owner: Architect Agent
plan: plan-022-settings-ia
phases:
  - phase-001-shell-layout-and-pillnav
  - phase-002-category-routing
  - phase-003-relocate-existing-surfaces
  - phase-004-tests
estimated_duration: 1d
risk_level: medium
---

## Goal

Stand up the new categorized settings shell — PillNav header + sub-routes for the five planned categories — and relocate the existing AI keys + Data Portability surfaces into their new homes with **zero behavior change**. The preferences storage layer the original draft asked for is **already shipped** and remains untouched.

## Context (already in tree — do not duplicate)

- `app_preferences` SQLite table exists in `src/lib/server/db/schema.ts` (line 339).
- Server service: `src/lib/server/preferences/preferences-service.ts` exports `getPreference`, `setPreference`, `deletePreference`.
- HTTP endpoint: `src/routes/api/db/preferences/[key]/+server.ts` (GET/PUT/DELETE).
- Client helper: `src/lib/preferences.ts` exports `getPreference<T>(key, default)`, `setPreference<T>(key, value)`, `deletePreference(key)` (SSR-safe).
- Already consumed by `reader-mode.svelte.ts`, `model-selection.svelte.ts`, `themeService.ts`, `OnboardingModal.svelte`, `ActiveProjectSection.svelte`.
- `src/lib/components/ui/PillNav.svelte` is the primitive (used by Pill Toolbar; same component).
- Existing settings page: `src/routes/settings/+page.svelte` renders `<ApiSettings />` from `$modules/settings` plus an inline Data Portability section linking to `/settings/migrate`.
- `$modules/settings` already exports `ApiSettings`, `ThemeSelector`, repositories, and theme service. Module boundaries clean.

## Exit Criteria

- New layout `src/routes/settings/+layout.svelte` renders a `PageHeader` + `PillNav` with five tabs: **Appearance**, **Defaults**, **Shortcuts**, **AI**, **Data**. Active tab driven by route segment.
- Sub-routes created (each owns its own `+page.svelte`):
  - `/settings/appearance` — placeholder body "Coming in stage-002".
  - `/settings/defaults` — placeholder body "Coming in stage-003".
  - `/settings/shortcuts` — placeholder body "Coming in stage-004".
  - `/settings/ai` — renders the existing `<ApiSettings />` (relocated, no other change).
  - `/settings/data` — renders the existing Data Portability section (extracted from the current `+page.svelte`), unchanged behavior.
- `/settings` (the old root) **redirects** to `/settings/appearance` (the canonical landing). Implemented in `src/routes/settings/+page.ts` via `throw redirect(307, '/settings/appearance')` from SvelteKit's `redirect` helper.
- All existing tests that targeted `/settings` continue to pass (or are updated to follow the redirect / hit the new sub-route).
- All quality gates green: `pnpm run lint`, `pnpm run check`, `pnpm run test`, `pnpm run test:visual`.
- New visual baseline: 1280×800 of `/settings/appearance` showing the PillNav with the Appearance pill selected (placeholder body acceptable).

## Phases

### Phase-001 — Shell layout + PillNav

- Create `src/routes/settings/+layout.svelte`:
  - Imports `PillNav` from `$lib/components/ui/PillNav.svelte` and the existing `PageHeader`.
  - Reads `page.url.pathname` from `$app/state` (already used elsewhere in the codebase) to derive `activeId` matching one of `appearance | defaults | shortcuts | ai | data`.
  - Items: `[{ id: 'appearance', label: 'Appearance' }, { id: 'defaults', label: 'Defaults' }, { id: 'shortcuts', label: 'Shortcuts' }, { id: 'ai', label: 'AI' }, { id: 'data', label: 'Data' }]`.
  - `onSelect={(id) => goto(\`/settings/\${id}\`)}`.
  - Wraps `{@render children()}` (Svelte 5 children rune pattern) inside a `<main class="settings-content">` shell.
  - Reuses the existing `<PageHeader>` wrapper from the current `/settings` page (eyebrow "Configuration", title "Integrations & Settings", description "Manage your external connections and global preferences."). Drop the inline summary cards — they were a feature of the flat page and don't fit the new IA.
- All styles use design tokens (no magic colors). New tokens NOT required; reuse existing `--color-surface-*`, `--space-*`, `--radius-*`.
- Layout file uses Svelte 5 runes only.

### Phase-002 — Category sub-routes

- Create the five `+page.svelte` files. Each:
  - Sets a `<svelte:head><title>{Category} — Novellum</title></svelte:head>`.
  - Renders a heading + body. Stages 002–006 will replace placeholder bodies.
- For `/settings/ai/+page.svelte`:
  - Imports `ApiSettings` from `$modules/settings` and renders it. **No other markup or props.**
- For `/settings/data/+page.svelte`:
  - Lifts the existing Data Portability section (the `<section class="settings-section" aria-labelledby="data-portability-heading">…</section>` markup in current `src/routes/settings/+page.svelte`) verbatim into this new file. Move associated styles from the old file's `<style>` block. Behavior identical.
- Other three placeholder files: simple `<h2>` + paragraph.
- Update `src/routes/settings/+page.svelte`:
  - **Replace the entire file** with a tiny shell that re-exports the redirect logic (or leave only `<svelte:head><title>Settings — Novellum</title></svelte:head>` + a noscript fallback). Better: delete the file entirely and let `+page.ts` handle the redirect.
- Create `src/routes/settings/+page.ts`:

  ```ts
  import { redirect } from '@sveltejs/kit';
  export const load = () => {
    throw redirect(307, '/settings/appearance');
  };
  ```

  If a redirect from a `+page.ts` requires the `+page.svelte` to also exist for SvelteKit's route inference, keep a one-line `<svelte:head><title>Settings</title></svelte:head>` placeholder file; otherwise delete.

### Phase-003 — Relocate existing surfaces

- The Data Portability `<section>` and its associated `<style>` rules move from `src/routes/settings/+page.svelte` to `src/routes/settings/data/+page.svelte`. Verify the link to `/settings/migrate` still works (it does — `/settings/migrate` is a separate route).
- The `<ApiSettings />` mount moves to `src/routes/settings/ai/+page.svelte`.
- Delete `src/routes/settings/+page.svelte` if it's no longer referenced after the redirect lands. Or keep as a one-line placeholder if SvelteKit complains.
- Confirm `src/modules/settings/components/ApiSettings.svelte` itself is **not** modified. The component must continue to work standalone.

### Phase-004 — Tests

- **Component (vitest):**
  - `tests/settings/settings-layout.test.ts` (new) — renders `+layout.svelte` with each pathname; PillNav `activeId` matches; `onSelect` calls `goto`.
- **Route (vitest + Testing Library):**
  - `tests/settings/settings-redirect.test.ts` (new) — load hook from `src/routes/settings/+page.ts` throws a redirect to `/settings/appearance`. Use SvelteKit's `redirect` matcher.
  - `tests/settings/settings-ai-page.test.ts` (new) — `/settings/ai/+page.svelte` renders `ApiSettings`'s heading/text. Spy that ApiSettings is mounted (use Testing Library `getByRole('heading', { name: /API Keys/i })` or whichever existing copy it uses).
  - `tests/settings/settings-data-page.test.ts` (new) — `/settings/data/+page.svelte` renders the Data Portability section (`getByRole('heading', { name: /Data Portability/i })` and the `/settings/migrate` link).
- **Visual (Playwright):**
  - `tests/visual/settings-shell.test.ts` (new) — 1280×800 baseline at `/settings/appearance`. Pill nav visible with Appearance selected; placeholder body shown.
- **Quality gates:** lint / check / test / test:visual all clean.
- Existing tests that hit `/settings` (if any) — find with `grep` and update to follow redirect or hit the canonical new sub-route.

## Decision Log Required

- Whether to delete the old `src/routes/settings/+page.svelte` outright or keep a placeholder. Record final outcome.
- Where the redirect lives (`+page.ts` server load vs route group + `+page.svelte` `goto` in `onMount`). Spec: `+page.ts`. Confirm.
- Visual baseline content — confirm the placeholder body for Appearance is in frame and the PillNav has the Appearance pill highlighted.
- Whether the `PageHeader` summary cards stay or drop. Spec: drop. Confirm.
- Confirm zero behavior change for AI keys and Data Portability surfaces.

## Out of Scope

- Any actual category content beyond placeholders (Appearance / Defaults / Shortcuts ship in stages 002 / 003 / 004 / 005 / 006).
- New SQLite migration — `app_preferences` already exists.
- New preferences-service code — already shipped and used by reader-mode, model-selection, theme service, onboarding, active-project section.
- Modifying `ApiSettings.svelte` content.
