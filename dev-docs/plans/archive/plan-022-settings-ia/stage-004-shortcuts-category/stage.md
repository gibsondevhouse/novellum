---
title: Shortcuts Category
slug: stage-004-shortcuts-category
stage_number: 4
status: complete
owner: Architect Agent
plan: plan-022-settings-ia
phases:
  - phase-001-keymap-registry
  - phase-002-customization-ui
  - phase-003-tests
estimated_duration: 1.5d
risk_level: medium
---

## Goal

Ship a customizable keyboard-shortcut system backed by the existing
`app_preferences` SQLite store. Create a typed `keymap-registry`
module that registers the five core actions with canonical defaults,
reads saved bindings from `app.shortcuts.bindings`, validates against
a deny-list and conflict rules, and persists changes via the existing
`setPreference` round-trip. Replace the `/settings/shortcuts`
placeholder with a full table UI — inline "press a key" recorder,
per-row conflict feedback, per-row reset, and a global "Reset all".
**No global `keydown` wiring in this stage**: only the registry and
settings UI ship here. App components that consume the bindings are
follow-up work.

## Context (already in tree — do not duplicate)

- `app_preferences` SQLite table and `/api/db/preferences/[key]`
  HTTP endpoint (GET / PUT / DELETE) are live and unchanged since
  stage-001.
- Client helper: `src/lib/preferences.ts` — `getPreference<T>(key,
  default)`, `setPreference<T>(key, value)`, `deletePreference(key)`;
  SSR-safe (short-circuits on server), best-effort (swallows errors).
- Server service: `src/lib/server/preferences/preferences-service.ts`
  — synchronous equivalents; used only by API route handlers.
- `/settings/shortcuts/+page.svelte` is the stage-001 placeholder;
  this stage replaces its entire body.
- Pattern reference: `src/routes/settings/appearance/+page.svelte`
  (imports `appearance.svelte.ts` store, calls `hydrate()` in
  `onMount`) and `src/routes/settings/defaults/+page.svelte` (same
  pattern). The shortcuts page follows the same `onMount` + local
  `$state` refresh pattern but uses a plain TS registry module
  instead of a `.svelte.ts` store (see Decision Log #1).
- `src/lib/platform/platform.ts` exports `getPlatform()` → `'web' |
  'dev' | 'desktop'`. It does **not** distinguish macOS from
  Windows/Linux. The `formatCombo` UI helper (in the page) detects
  macOS separately via `navigator.userAgent` (see Phase-002).
- `src/lib/keyboard/` directory does **not** yet exist — created in
  Phase-001.
- No existing action-based hotkey registry anywhere in the codebase.
  Existing `keydown` handlers are all local/dismiss-only (Escape,
  Enter in form fields); none are configurable.

## Exit Criteria

- `src/lib/keyboard/keymap-registry.ts` exists and exports:
  `ActionDef`, `ActionEntry`, `registerAction`, `getBinding`,
  `listActions`, `loadBindings`, `saveBinding`, `resetBinding`,
  `resetAll`, `hasConflict`.
- `src/lib/keyboard/index.ts` barrel re-exports all of the above.
- Five core actions registered at module load with correct ids,
  labels, descriptions, and default bindings (see Phase-001).
- `getBinding(id)` returns `customBindings[id] ?? def.default`; an
  unknown id returns `''`.
- `hasConflict(actionId, combo)` returns `true` when `combo` matches
  any other action's current binding.
- `saveBinding` rejects a denied combo with `{ ok: false, error:
  'denied' }` and a conflicting combo with `{ ok: false, error:
  'conflict' }` — neither call `setPreference`.
- A valid `saveBinding` call persists `app.shortcuts.bindings` via
  `setPreference`.
- `loadBindings()` fetches `app.shortcuts.bindings` and populates the
  module-level `customBindings` record.
- `resetBinding(id)` removes the custom binding for `id` and
  persists.
- `resetAll()` clears `customBindings` to `{}` and persists.
- `/settings/shortcuts/+page.svelte` renders a table of all five
  registered actions: Action, Description, Shortcut, Controls
  columns.
- Edit button per row activates inline "press a key" recording mode.
- Pressing a non-modifier key while recording captures the combo,
  calls `saveBinding`, exits recording on success.
- Pressing Escape cancels recording without mutating any state.
- A conflict or deny-list rejection shows an inline error in that row
  and keeps recording open.
- Reset button per row calls `resetBinding` and reverts the row to
  its default.
- "Reset all" button at bottom calls `resetAll` and reverts all rows.
- Changes are saved immediately; no explicit "Save" button required.
- `tests/lib/keyboard/keymap-registry.test.ts` achieves ≥80% line
  coverage of `keymap-registry.ts` (verified by `pnpm run
  test:coverage`).
- `tests/settings/settings-shortcuts-page.test.ts` covers: table
  render, recording mode, conflict error, deny-list error, reset per
  row, reset all.
- `pnpm run lint`, `pnpm run check`, `pnpm run test --run` all pass.

## Phases

### Phase-001 — Keymap Registry

**Goal:** Create `src/lib/keyboard/` with a typed, preference-backed
action registry that owns all binding state, conflict detection, and
persistence. Conflict detection is inseparable from `saveBinding`'s
contract and is implemented here, not as a separate phase.

**Files:**

1. **`src/lib/keyboard/keymap-registry.ts`** (new)

   _Types:_

   ```ts
   export interface ActionDef {
     label: string;
     description: string;
     default: string;
   }

   export interface ActionEntry extends ActionDef {
     id: string;
     current: string; // customBindings[id] ?? default
   }

   export type SaveResult =
     | { ok: true }
     | { ok: false; error: 'denied' | 'conflict' };
   ```

   _Module-level state (plain mutable TS — not Svelte runes; see
   Decision Log #1):_

   ```ts
   const actionsMap = new Map<string, ActionDef>();
   let customBindings: Record<string, string> = {};
   ```

   _Deny-list (constant, never mutated at runtime):_

   ```ts
   const DENIED_COMBOS: readonly string[] = [
     'Meta+Q', 'Meta+W', 'Meta+H', 'Meta+M', 'Meta+Tab', 'Alt+F4',
   ];
   ```

   _Exports:_

   - `registerAction(id: string, def: ActionDef): void` — idempotent:
     `if (actionsMap.has(id)) return; actionsMap.set(id, def)`.
   - `getBinding(actionId: string): string` — returns
     `customBindings[actionId] ?? actionsMap.get(actionId)?.default ?? ''`.
   - `listActions(): ActionEntry[]` — maps `actionsMap` entries to
     `{ id, ...def, current: getBinding(id) }`.
   - `hasConflict(actionId: string, combo: string): boolean` — returns
     `true` if `combo === getBinding(otherId)` for any registered
     `otherId !== actionId`.
   - `loadBindings(): Promise<void>` — calls `getPreference<Record<
     string, string>>('app.shortcuts.bindings', {})` and assigns the
     result to `customBindings`. SSR-safe because `getPreference`
     short-circuits server-side.
   - `saveBinding(actionId: string, combo: string): Promise<SaveResult>`
     — validates in order: (1) `DENIED_COMBOS.includes(combo)` → return
     `{ ok: false, error: 'denied' }`; (2) `hasConflict(actionId,
     combo)` → return `{ ok: false, error: 'conflict' }`; (3) assign
     `customBindings[actionId] = combo`, call `setPreference('app.
     shortcuts.bindings', customBindings)`, return `{ ok: true }`.
   - `resetBinding(actionId: string): Promise<void>` — deletes
     `customBindings[actionId]`, calls `setPreference('app.shortcuts.
     bindings', customBindings)`.
   - `resetAll(): Promise<void>` — sets `customBindings = {}`, calls
     `setPreference('app.shortcuts.bindings', {})`.

   _Module-level core action registration (at end of file, after all
   function definitions):_

   | id | label | description | default |
   | --- | --- | --- | --- |
   | `new-project` | New Project | Create a new writing project | `Meta+N` |
   | `open-settings` | Open Settings | Navigate to Settings | `Meta+,` |
   | `toggle-sidebar` | Toggle Sidebar | Show or hide the main sidebar | `Meta+Shift+B` |
   | `save-scene` | Save Scene | Manually save the current scene | `Meta+S` |
   | `view-in-reader` | View in Reader | Open the current project in reader mode | `Meta+Shift+R` |

   Binding format uses `Meta` for the macOS/Windows platform meta key
   (macOS Cmd, Windows Win). `Ctrl` is used for the control key.
   Combo segments joined by `+`. Examples: `Meta+N`, `Meta+,`,
   `Meta+Shift+B`, `Ctrl+Alt+S`.

2. **`src/lib/keyboard/index.ts`** (new)

   Re-exports everything from `./keymap-registry.js` using named
   re-export: `export * from './keymap-registry.js'`.

**Acceptance:**

- `pnpm run check` → zero TypeScript errors.
- `listActions()` returns exactly 5 entries immediately after module
  import (registration runs at module level).
- `getBinding('save-scene')` returns `'Meta+S'` before any custom
  binding is set.
- `hasConflict('toggle-sidebar', 'Meta+S')` returns `true` (conflicts
  with `save-scene` default).
- `hasConflict('toggle-sidebar', 'Meta+Shift+Z')` returns `false`
  (no registered action uses this combo).
- `saveBinding('new-project', 'Meta+Q')` returns `{ ok: false,
  error: 'denied' }` without calling `setPreference`.
- `saveBinding('new-project', 'Meta+S')` returns `{ ok: false,
  error: 'conflict' }` without calling `setPreference`.
- After `saveBinding('new-project', 'Meta+G')`, `getBinding('new-
  project')` returns `'Meta+G'` and `setPreference` was called with
  `'app.shortcuts.bindings'`.

---

### Phase-002 — Customization UI

**Goal:** Replace `/settings/shortcuts/+page.svelte` with the full
shortcut management table. Follows the same `onMount` + local
`$state` refresh pattern used by the Appearance and Defaults pages.

**Files:**

1. **`src/routes/settings/shortcuts/+page.svelte`** (full replacement)

   _Script block (Svelte 5, `<script lang="ts">`):_

   - Imports: `onMount` from `'svelte'`; `loadBindings`, `listActions`,
     `saveBinding`, `resetBinding`, `resetAll` from
     `'$lib/keyboard/index.js'`; `type ActionEntry` from
     `'$lib/keyboard/index.js'`.
   - State (Svelte 5 runes):
     - `let actions: ActionEntry[] = $state([])` — refreshed after
       every mutation.
     - `let recording: string | null = $state(null)` — actionId
       currently being recorded, or `null`.
     - `let errors: Record<string, string> = $state({})` — keyed by
       actionId; cleared per-row on new recording attempt.
   - `onMount`: `await loadBindings(); actions = listActions();`
   - `function startRecording(id: string)` — sets `recording = id`,
     deletes `errors[id]`.
   - `function cancelRecording()` — sets `recording = null`.
   - `async function handleKey(e: KeyboardEvent)` — top-level window
     keydown handler (attached via `<svelte:window onkeydown={...}>`),
     no-ops if `recording === null`. First checks for Escape → calls
     `cancelRecording()` and `e.preventDefault()`. Otherwise calls
     `buildCombo(e)`: if `null` (modifier-only), returns early.
     Calls `await saveBinding(recording, combo)`. On `ok: true`: sets
     `actions = listActions()`, sets `recording = null`. On `ok:
     false`: sets `errors[recording] = result.error === 'denied' ?
     'This shortcut is reserved by the OS.' : 'Already used by
     another action.'`. Does NOT clear recording.
   - `buildCombo(e: KeyboardEvent): string | null` — pure helper.
     Returns `null` if `e.key` is one of `'Meta', 'Control', 'Alt',
     'Shift'`. Otherwise assembles parts: `[e.metaKey ? 'Meta' : '',
     e.ctrlKey ? 'Ctrl' : '', e.altKey ? 'Alt' : '', e.shiftKey ?
     'Shift' : '', e.key].filter(Boolean).join('+')`. Example:
     `Meta+Shift+s` → normalize `e.key` to uppercase single chars
     only when length is 1 (`e.key.length === 1 ? e.key.toUpperCase()
     : e.key`).
   - `formatCombo(combo: string): string` — pure display helper.
     Detects macOS via `typeof navigator !== 'undefined' &&
     /Mac/i.test(navigator.userAgent)`. On macOS: replaces `Meta+`
     with `⌘`, `Shift+` with `⇧`, `Alt+` with `⌥`, `Ctrl+` with
     `⌃`. On non-macOS: replaces `Meta` with `Win`. Returns the
     formatted string. Used only in the template.
   - `async function doReset(id: string)` — calls `await
     resetBinding(id)`, sets `actions = listActions()`.
   - `async function doResetAll()` — calls `await resetAll()`, sets
     `actions = listActions()`.

   _Template:_

   - `<svelte:head><title>Shortcuts — Novellum</title></svelte:head>`
   - `<svelte:window onkeydown={handleKey} />` — active at all times;
     `handleKey` no-ops when `recording === null`.
   - Outer `<div class="shortcuts">` with:
     - `<h1 class="shortcuts__title">Shortcuts</h1>`
     - `<p class="shortcuts__description">` — brief explainer.
     - `<section class="shortcuts__section" aria-labelledby=
       "shortcuts-table-heading">`:
       - `<h2 id="shortcuts-table-heading" class="shortcuts__heading">
         Key Bindings</h2>`
       - `<SurfaceCard variant="flat">` wrapping a `<table
         class="shortcuts__table">` with `<thead>` columns: Action,
         Description, Shortcut, and an empty Controls header.
       - `{#each actions as action (action.id)}` — one `<tr>` per row.
         Row states:
         - **Normal**: `<td>` with `action.label`; `<td>` with
           `action.description`; `<td class="shortcuts__binding">`
           with `formatCombo(action.current)`; `<td>` with two
           `<button>` elements: "Edit" (calls `startRecording(action.
           id)`) and "Reset" (calls `doReset(action.id)`). Edit and
           Reset buttons are `disabled` when `recording !== null &&
           recording !== action.id`.
         - **Recording** (`recording === action.id`): shortcut cell
           shows `<span class="shortcuts__recorder">Press a key…
           </span>`; controls cell shows a "Cancel" link (calls
           `cancelRecording()`). If `errors[action.id]` is set,
           render `<span class="shortcuts__error" role="alert">
           {errors[action.id]}</span>` below the recorder span.
   - "Reset all" `<button class="shortcuts__reset-all">` at bottom
     of the section; disabled while `recording !== null`.
   - `<style>` block: `.shortcuts__*` BEM namespace; tokens only
     (`--color-surface-*`, `--space-*`, `--text-*`, `--radius-*`,
     `--font-weight-*`). No magic colors.

**Acceptance:**

- Page renders all 5 action rows on mount (after `loadBindings` +
  `listActions`).
- Shortcut column shows formatted combos (e.g., `⌘N` on macOS).
- Clicking Edit on one row enters recording mode; all other rows'
  Edit/Reset buttons are disabled.
- Pressing Escape cancels recording; `actions` unchanged.
- Pressing a valid key combo in recording mode: `saveBinding` called,
  binding updated in table, recording closed.
- `saveBinding` returning `{ ok: false, error: 'conflict' }` shows
  "Already used by another action." in-row; recording stays open.
- `saveBinding` returning `{ ok: false, error: 'denied' }` shows
  "This shortcut is reserved by the OS." in-row; recording stays
  open.
- Reset button on a row reverts that row's shortcut to its default.
- "Reset all" reverts all rows to defaults.
- `pnpm run lint`, `pnpm run check` pass.

---

### Phase-003 — Tests

**Goal:** Cover `keymap-registry.ts` at ≥80% line coverage and
validate all critical UI paths of the shortcuts page component.

**Files:**

1. **`tests/lib/keyboard/keymap-registry.test.ts`** (new)

   Mock setup (at top of file before imports, matching the pattern
   in `tests/settings/appearance-page.test.ts`):

   ```ts
   const getPreference = vi.fn();
   const setPreference = vi.fn();
   vi.mock('$lib/preferences.js', () => ({
     getPreference: (...args) => getPreference(...args),
     setPreference: (...args) => setPreference(...args),
   }));
   ```

   Because `keymap-registry.ts` registers the five actions at module
   level, re-import the module fresh in each test via
   `vi.resetModules()` + dynamic import inside `beforeEach`, or use
   `vi.isolateModules`. This ensures `customBindings` is reset between
   tests.

   Test cases (minimum set — extend as needed for coverage):

   - **`registerAction` is idempotent**: calling it twice with the
     same id does not overwrite; `listActions()` still returns 5
     entries.
   - **`getBinding` returns default when no custom binding**: `getBinding
     ('save-scene')` === `'Meta+S'`.
   - **`getBinding` returns custom binding after `loadBindings`**: mock
     `getPreference` to return `{ 'save-scene': 'Meta+G' }`; call
     `await loadBindings()`; assert `getBinding('save-scene')` ===
     `'Meta+G'`.
   - **`listActions()` returns 5 entries with required fields**: each
     entry has `id`, `label`, `description`, `default`, `current`.
   - **`hasConflict` true case**: `hasConflict('toggle-sidebar',
     'Meta+S')` returns `true`.
   - **`hasConflict` false case**: `hasConflict('toggle-sidebar',
     'Meta+Shift+Z')` returns `false`.
   - **`hasConflict` false for same action**: `hasConflict('save-scene',
     'Meta+S')` returns `false` (an action cannot conflict with
     itself).
   - **`saveBinding` deny-list rejection**: `saveBinding('new-project',
     'Meta+Q')` returns `{ ok: false, error: 'denied' }`; `setPreference`
     not called.
   - **`saveBinding` conflict rejection**: `saveBinding('new-project',
     'Meta+S')` returns `{ ok: false, error: 'conflict' }`; `setPreference`
     not called.
   - **`saveBinding` success**: `saveBinding('new-project', 'Meta+G')`
     returns `{ ok: true }`; `setPreference` called once with
     `'app.shortcuts.bindings'` and an object containing
     `'new-project': 'Meta+G'`.
   - **`resetBinding`**: after a successful `saveBinding`, call
     `resetBinding('new-project')`; assert `getBinding('new-project')`
     === `'Meta+N'` (default); `setPreference` called.
   - **`resetAll`**: after saving multiple bindings, call `resetAll()`;
     `listActions()` shows all `current === default`; `setPreference`
     called with `{ }`.
   - **`loadBindings` round-trip**: mock `getPreference` to return a
     saved bindings object; call `loadBindings()`; assert `getBinding`
     returns the saved values.

2. **`tests/settings/settings-shortcuts-page.test.ts`** (new)

   Mock setup (full mock of the keyboard module — no real preference
   I/O in component tests):

   ```ts
   const loadBindings = vi.fn().mockResolvedValue(undefined);
   const listActions = vi.fn();
   const saveBinding = vi.fn();
   const resetBinding = vi.fn().mockResolvedValue(undefined);
   const resetAll = vi.fn().mockResolvedValue(undefined);

   vi.mock('$lib/keyboard/index.js', () => ({
     loadBindings: (...args) => loadBindings(...args),
     listActions: (...args) => listActions(...args),
     saveBinding: (...args) => saveBinding(...args),
     resetBinding: (...args) => resetBinding(...args),
     resetAll: (...args) => resetAll(...args),
   }));
   ```

   Fixture: a helper that returns a 5-entry `ActionEntry[]` array
   with `current === default` for each action. `listActions` returns
   this fixture by default.

   `mount` / `unmount` pattern from `appearance-page.test.ts`:
   `mount(ShortcutsPage, { target, props: {} })` after `flushSync()`.

   Test cases:

   - **Renders heading**: `getByRole('heading', { name: /shortcuts/i })`
     present.
   - **Renders all 5 rows**: 5 rows in the table (or 5 Edit buttons).
   - **Row shows label, description, shortcut**: first row contains
     `'New Project'`, its description, and the formatted binding.
   - **Edit activates recording mode**: click Edit on first row;
     assert "Press a key…" text appears.
   - **Escape cancels recording**: dispatch `keydown` with `key:
     'Escape'` on window; assert recording UI gone; `saveBinding` not
     called.
   - **Valid key capture calls `saveBinding`**: with `saveBinding`
     mocked to return `{ ok: true }` and `listActions` returning
     updated fixture, dispatch a keydown (`metaKey: true, key: 'G'`);
     assert `saveBinding` called with `('new-project', 'Meta+G')`.
   - **Conflict error shown**: `saveBinding` returns `{ ok: false,
     error: 'conflict' }`; assert error text "Already used" visible.
   - **Denied error shown**: `saveBinding` returns `{ ok: false,
     error: 'denied' }`; assert error text "reserved by the OS"
     visible.
   - **Reset row**: click Reset on first row; assert `resetBinding`
     called with `'new-project'`.
   - **Reset all**: click "Reset all" button; assert `resetAll`
     called.

**Acceptance:**

- `pnpm run test tests/lib/keyboard/ --coverage` → `keymap-registry.ts`
  line coverage ≥80%.
- `pnpm run test tests/settings/settings-shortcuts-page.test.ts` →
  all cases pass.
- `pnpm run test --run` → full suite green (no regressions).
- `pnpm run lint` → zero errors.

## Decision Log

1. **Plain TS module vs Svelte store for the registry.** The registry
   lives in `src/lib/keyboard/keymap-registry.ts` (not `.svelte.ts`)
   and uses plain mutable module-level state. This avoids Svelte rune
   context errors when the module is imported outside component
   context (tests, future server-side consumers). The page holds its
   own `$state([])` copy of `listActions()` and refreshes it after
   each mutation. Tradeoff accepted: no automatic reactivity, but the
   mutation surface is small and explicit — every write path ends with
   `actions = listActions()`.

2. **Single JSON blob for bindings (`app.shortcuts.bindings`).** All
   custom bindings are stored as one `Record<string, string>` in a
   single preference row rather than per-action keys. This keeps the
   `app_preferences` table lean and makes `resetAll` a single PUT.
   Tradeoff: concurrent writes from two browser tabs overwrites the
   other's changes — acceptable at this product stage (single-user,
   single-session desktop app).

3. **Canonical combo format uses `Meta` (not `Cmd` / `Win`).** Stored
   bindings use `Meta` for the platform meta key (Cmd on macOS, Win
   key on Windows). `formatCombo()` in the UI converts `Meta` → `⌘`
   on macOS and `Meta` → `Win` on other platforms. Keeps persistence
   clean and test assertions deterministic regardless of test runner
   host OS.

4. **`hasConflict(id, combo)` returns `false` when `combo` matches
   the action's own current binding.** A user re-saving the same key
   for the same action is a no-op (not an error). `saveBinding` then
   persists the unchanged value harmlessly.

5. **Recording mode uses `<svelte:window onkeydown>` gated by
   `recording !== null`.** Alternative was an auto-focused invisible
   `<input>` in the recording row, which causes scroll jitter and
   a11y issues (invisible focus). The window-level handler with an
   early return is simpler, already used elsewhere in the codebase
   for modal dismiss patterns.

6. **Phase consolidation: conflict detection folded into phase-001.**
   The original stub had 4 phases with conflict detection as a
   separate phase-003. `hasConflict` and `saveBinding` validation are
   inseparable from the registry contract; splitting them would leave
   the registry in an unusable intermediate state between phases.
   Consolidated to 3 phases (registry, UI, tests).

7. **`registerAction` idempotency: skip-if-already-registered.** The
   guard is `if (actionsMap.has(id)) return`. This prevents hot-reload
   re-registration from clobbering custom entries added by future
   downstream callers (e.g., a module-specific plugin registering its
   own actions). All five core actions are registered at module load
   time below the function definitions.

8. **`src/lib/platform/platform.ts` is not used for macOS detection.**
   That module returns `'web' | 'dev' | 'desktop'` (Tauri detection),
   not OS family. `formatCombo` uses `navigator.userAgent` regex
   `/Mac/i` for display-only macOS detection. This is isolated to the
   UI layer and does not affect stored binding strings.

## Out of Scope

- Global `keydown` listeners in app components (AppShell, editor,
  etc.) that _execute_ registered actions. That is follow-up work,
  planned for plan-023 or a dedicated shortcuts-wiring stage.
- Tauri native menu / OS-level hotkey registration.
- Per-profile or per-project shortcut overrides; global user
  preference only.
- Importing or exporting shortcut configs as a `.json` file.
- Touch / gesture equivalents for shortcuts.
- Undo/redo history for binding changes (per-row and global Reset
  cover the rollback use case).
- New SQLite migrations — `app_preferences` table already exists.
- Modifications to `preferences-service.ts` or the
  `/api/db/preferences` endpoint — consumed as-is.
