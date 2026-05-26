---
title: Defaults Category
slug: stage-003-defaults-category
stage_number: 3
status: complete
owner: Architect Agent
plan: plan-022-settings-ia
phases:
  - phase-001-defaults-store
  - phase-002-default-home-page
  - phase-003-default-reader-view
  - phase-004-default-project-type-and-model
  - phase-005-tests
estimated_duration: 1d
risk_level: low
---

## Goal

Ship the Defaults settings panel: Default Home Page, Default Reader View, Default Project Type, Default AI Model. Each persists via the existing preferences service. Stage-003 wires the Default Home Page **end-to-end** (the root route `/` reads it on load and redirects accordingly). The other three defaults ship setters/getters + UI; their consumers live in their owning plans (reader view → plan-023 stage-007; project type → project-hub creation flow; AI model → existing `model-selection.svelte.ts` already canonical, this stage only re-exposes it).

## Context (already in tree — do not duplicate)

- `src/lib/preferences.ts` — async client. SSR-safe. `getPreference<T>(key, default)`, `setPreference<T>(key, value)`.
- `src/lib/stores/reader-mode.svelte.ts` — `ReaderMode = 'classic' | 'book' | 'fullscreen'`. Already persists active reader mode under `app.readerMode`. Stage-003 introduces a separate **default** reader view (the one used when first opening a book).
- `src/lib/stores/model-selection.svelte.ts` — canonical model selection with `AVAILABLE_MODELS`, persisted under `app.selectedModel`. Stage-003 surfaces this in the Defaults panel (as "Default AI Model"); no new pref key — the existing `app.selectedModel` IS the default.
- `src/lib/db/domain-types.ts` — `projectType: 'novel' | 'story' | 'collection'`.
- `src/routes/+page.ts` — currently `export const load = async () => ({});`. Stage-003 leaves it untouched and adds a sibling `src/routes/+page.server.ts` that performs the redirect server-side.
- `src/lib/server/preferences/preferences-service.ts` — synchronous server-side `getPreference<T>(key): T | undefined`. Use this from `+page.server.ts` (the client `src/lib/preferences.ts` short-circuits on the server and would always return the default).
- `src/lib/server/db/index.js` — exports `db` (better-sqlite3 handle). Use it directly in `+page.server.ts` to query the most-recent `lastOpenedAt` project. The `projects` table column `lastOpenedAt` defaults to the empty string `''` (NOT null) — filter accordingly.
- `src/routes/+page.svelte` — the Library view. Remains the destination for the `library` choice and the fallback for every other choice when its target is unresolvable.
- Stage-001 placeholder lives at `src/routes/settings/defaults/+page.svelte`. Replace its body in this stage.
- Stage-002 established the Appearance pattern: singleton store at `src/lib/stores/<name>.svelte.ts`, hydrated on first route mount, custom `role="radiogroup"` + `<button role="radio" aria-checked>` for tri-state pickers. Reuse the pattern verbatim.

## Exit Criteria

- `/settings/defaults` renders four subsections: Default Home Page, Default Reader View, Default Project Type, Default AI Model.
- **Default Home Page:**
  - Three-step radiogroup: Library, Last Read Book, Last Opened Project.
  - Persists `app.defaults.homePage` (`'library' | 'last-read' | 'last-project'`). Default: `'library'`.
  - Server-side (new `src/routes/+page.server.ts`) reads the preference and redirects:
    - `'library'` → no redirect (return `{}`).
    - `'last-read'` → resolve `lastBookId` (see Resolution Rules); redirect to `/books/<id>` if found, otherwise return `{}`.
    - `'last-project'` → resolve most-recently-opened project via direct SQLite query; redirect to `/projects/<id>` if found, otherwise return `{}`.
  - No redirect loops: `+page.server.ts` only runs at `/`.
- **Default Reader View:**
  - Three-step radiogroup: Classic, Book, Fullscreen.
  - Persists `app.defaults.readerView` (`'classic' | 'book' | 'fullscreen'`). Default: `'classic'`.
  - Stage-003 ships the store + UI. Plan-023 stage-007 wires the reader entry point to consume it.
- **Default Project Type:**
  - Three-step radiogroup: Novel, Story, Collection.
  - Persists `app.defaults.projectType` (`'novel' | 'story' | 'collection'`). Default: `'novel'`.
  - Stage-003 ships the store + UI. Project-hub create flow consumes it in a follow-up; this stage only exposes a getter.
- **Default AI Model:**
  - Mounts a labelled `<select>` (or pill list) sourced from `AVAILABLE_MODELS` in `src/lib/stores/model-selection.svelte.ts`. Writes through the existing `setSelectedModel()` (or equivalent setter — re-use, do not duplicate).
  - Persists under the existing `app.selectedModel` pref key. **Do not introduce a parallel `app.defaults.aiModel` key.**
  - When `AVAILABLE_MODELS.length === 1` (the current state), render the picker as a disabled, single-option control with a small caption ("More models coming soon"). Do not hide the section.
- New singleton store at `src/lib/stores/defaults.svelte.ts` exposes:
  - `getDefaultHomePage(): HomePage`, `setDefaultHomePage(value: HomePage): Promise<void>`
  - `getDefaultReaderView(): ReaderMode`, `setDefaultReaderView(value: ReaderMode): Promise<void>`
  - `getDefaultProjectType(): ProjectType`, `setDefaultProjectType(value: ProjectType): Promise<void>`
  - `hydrate(): Promise<void>` — reads all three prefs in parallel, sets reactive state, idempotent.
  - Module-load instantiation. SSR-safe (no `document`/`localStorage` access at module top level).
- All quality gates green (lint, check, test, visual).

## Resolution Rules — Default Home Page

The redirect logic in `src/routes/+page.server.ts` MUST be implemented exactly as follows. The intent is "best-effort: if the user's preferred destination cannot be resolved, fall back to the library silently".

1. **Read the preference.** Use the **server-side** `getPreference<HomePage>('app.defaults.homePage')` from `$lib/server/preferences/preferences-service`. If `undefined`, treat as `'library'`.
2. **Branch on value:**
   - `'library'` → return `{}` (no redirect).
   - `'last-read'`:
     - Read `getPreference<{ lastBookId: string | null }>('app.readerMode')` (the existing reader-mode store persists `lastBookId` inside this same payload — see `src/lib/stores/reader-mode.svelte.ts`).
     - If `remote?.lastBookId` is a non-empty string → `throw redirect(307, '/books/' + lastBookId)`.
     - Otherwise → return `{}`.
   - `'last-project'`:
     - Query SQLite directly: `db.prepare("SELECT id FROM projects WHERE lastOpenedAt != '' ORDER BY lastOpenedAt DESC LIMIT 1").get()` (cast row to `{ id: string } | undefined`).
     - If a row is found → `throw redirect(307, '/projects/' + row.id)`.
     - Otherwise → return `{}`.
3. **Never redirect to `/`** under any branch (would loop).
4. **All errors during resolution** (DB failure, malformed pref) → silently fall back to `{}`. Wrap each branch's I/O in `try/catch`. Log via `console.warn` only when `dev` is true (use `import { dev } from '$app/environment'`).
5. **Re-throw `redirect`.** SvelteKit's `redirect()` works by throwing — the surrounding `try/catch` MUST re-throw redirects (check via `if (err instanceof Redirect)` from `@sveltejs/kit`, OR isolate the `try/catch` to only the I/O call and place the `throw redirect(...)` outside it).

## Phases

### phase-001-defaults-store

Create `src/lib/stores/defaults.svelte.ts`. Minimal API surface above. Tests in `tests/settings/defaults-store.test.ts` covering:

- Defaults when no prefs exist (`'library'` / `'classic'` / `'novel'`).
- Setters write through `setPreference` and update reactive state.
- `hydrate()` is idempotent (calling twice produces no double-fetch).
- `hydrate()` populates state from the SQLite-canonical values.

Do **not** include AI model in this store — the Default AI Model UI delegates to `model-selection.svelte.ts` directly.

### phase-002-default-home-page

Implement the redirect in a new `src/routes/+page.server.ts` per Resolution Rules above (do **not** modify the existing universal `+page.ts`). Mount the picker in `/settings/defaults/+page.svelte` (subsection 1). Ship dedicated tests in `tests/settings/default-home-page.test.ts` covering all six branches (3 values × 2 outcomes each: resolvable + unresolvable). Mock the server-side `getPreference` and the `db` handle from `$lib/server/db/index.js` (use `vi.mock('$lib/server/db/index.js', ...)` and `vi.mock('$lib/server/preferences/preferences-service', ...)`).

### phase-003-default-reader-view

Mount the picker in `/settings/defaults/+page.svelte` (subsection 2). Wires through `defaults.svelte.ts`. No reader code touched in this stage (plan-023 stage-007 does that).

### phase-004-default-project-type-and-model

Mount subsections 3 and 4. Project Type writes through `defaults.svelte.ts`. AI Model writes through `model-selection.svelte.ts` (re-export `setSelectedModel` and `AVAILABLE_MODELS` if needed, but do not duplicate). When `AVAILABLE_MODELS.length === 1`, render the disabled-single-option state described in Exit Criteria.

### phase-005-tests

- `tests/settings/defaults-page.test.ts` — component test for `/settings/defaults/+page.svelte`. Covers: all four subsections render; clicking a non-active pill calls the corresponding setter exactly once; the AI Model section renders the disabled single-option state when `AVAILABLE_MODELS.length === 1` (mock the import).
- `tests/settings/default-home-page.test.ts` — already authored in phase-002.
- `tests/settings/defaults-store.test.ts` — already authored in phase-001.
- Visual: regenerate `settings-shell.png` only if it currently frames `/settings/defaults` (it does not as of stage-002 — it frames `/settings/appearance`). If the existing baseline framed Defaults, regenerate. Otherwise, no visual baseline change. **Do not add a new visual test in this stage.**

## Quality Gates

- `pnpm run lint` — boundaries clean, zero new warnings.
- `pnpm run check` — zero errors. (Stage-002 cleared the prior 3 errors; this stage must keep that baseline.)
- `pnpm run test` — current 755/755. New tests bring total to ~770+.
- `pnpm run test:visual` — current 21/21. No regression.

## Constraints

- Svelte 5 runes only (`$state`, `$derived`, `$props`, `$effect`).
- Picker primitive: reuse the stage-002 pattern verbatim (`role="radiogroup"` + `<button role="radio" aria-checked>` with text labels). Do not introduce a new component.
- Store at `src/lib/stores/defaults.svelte.ts`. Do **not** put it under `$modules/settings/stores` — plan-023 stage-007 and the project-hub flow need to consume it across module boundaries.
- Pref keys exactly: `app.defaults.homePage`, `app.defaults.readerView`, `app.defaults.projectType`. AI model uses the existing `app.selectedModel` (no new key).
- `src/routes/+page.server.ts` MUST own the redirect (server-side). Do **not** modify the existing universal `src/routes/+page.ts`. Do **not** implement the redirect client-side in `+page.svelte` (would flash the library before redirecting).
- All errors during home-page resolution silently fall back. No user-facing error UI.
- No emoji or icons in pill labels.
- Do not modify `model-selection.svelte.ts`, `reader-mode.svelte.ts`, `themeService.ts`, or `ThemeSelector.svelte`.
- Do not delete or relocate the existing project-hub creation flow — Default Project Type is consumed in a follow-up.

## Deliverables

1. New: `src/lib/stores/defaults.svelte.ts`.
2. New: `tests/settings/defaults-store.test.ts`, `tests/settings/default-home-page.test.ts`, `tests/settings/defaults-page.test.ts`.
3. New: `src/routes/+page.server.ts` (redirect logic).
4. Modified: `src/routes/settings/defaults/+page.svelte` (real content).
5. Implementation log at `dev-docs/plans/plan-022-settings-ia/stage-003-defaults-category/impl-log.md` recording:
   - Confirmation that the redirect was implemented in `+page.server.ts` (not the universal `+page.ts`).
   - Confirmation that `'last-read'` reuses the existing `app.readerMode` payload's `lastBookId` field (no new key).
   - The exact UI primitive chosen for the AI Model section (disabled `<select>` vs. disabled radiogroup) and why.
   - Final test counts (vitest + visual) and boundaries clean confirmation.
   - Any deviations from spec.
6. Stage frontmatter `status: ready` → `status: complete` once gates pass.
