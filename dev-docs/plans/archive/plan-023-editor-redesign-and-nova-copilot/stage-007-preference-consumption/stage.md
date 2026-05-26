---
title: Preference Consumption
slug: stage-007-preference-consumption
stage_number: 7
status: complete
owner: Architect Agent
plan: plan-023-editor-redesign-and-nova-copilot
phases:
  - phase-001-editor-pane-prefs
  - phase-002-default-reader-on-handoff
  - phase-003-tests
estimated_duration: 1d
risk_level: low
---

## Goal

The editor and the view-in-reader handoff honor preferences set
in the settings IA shipped by plan-022.

## Entry Criteria

- plan-022 stages 002 (Appearance) and 003 (Defaults) are merged. ✅

## Exit Criteria

- Editor pane typography reads `--editor-font-size` / `--editor-line-height` CSS tokens
  (bound on `<html>` by the `appearance` store) instead of hardcoded values.
  The editor route hydrates `appearance` on mount so the tokens are applied before first paint.
- View-in-reader honors `defaultReaderView` on first open (when no saved reader mode
  exists in localStorage). If a mode has been saved previously, the saved value is preserved.
- Tests cover: CSS token binding in `ManuscriptEditorPane`, `appearance.hydrate()` call in the
  editor route, and the `defaultReaderView` guard + application in the reader route.
- All quality gates green.

## Phases

### phase-001-editor-pane-prefs

`src/modules/editor/components/ManuscriptEditorPane.svelte` — Replace hardcoded typography:

- `font-size: clamp(1rem, 1vw + 0.9rem, 1.1rem)` → `font-size: var(--editor-font-size)`
- `line-height: 1.9` → `line-height: var(--editor-line-height)`

`src/routes/projects/[id]/editor/+page.svelte` — Add `onMount` + `appearance.hydrate()`:

- Import `onMount` from `svelte`
- Import `appearance` from `$lib/stores/appearance.svelte.js`
- Call `void appearance.hydrate()` inside `onMount`

### phase-002-default-reader-on-handoff

`src/routes/books/[id]/+page.svelte` — Honor default reader view on first open:

- Import `defaults` from `$lib/stores/defaults.svelte.js`
- Extend `onMount` to be `async`
- Check `localStorage.getItem('novellum:reader')` — if null (no saved mode), call
  `await defaults.hydrate()` then `setReaderMode(defaults.readerView)`

### phase-003-tests

- `tests/editor/appearance-consumption.test.ts` — 6 source-string tests covering CSS token
  binding in `ManuscriptEditorPane` and `appearance.hydrate()` call in the editor route.
- `tests/reader/default-reader-view.test.ts` — 5 source-string tests covering defaults store
  import, localStorage guard, hydration call, and `setReaderMode` application.

## Quality Gates

| Gate | Result |
| --- | --- |
| `pnpm run lint` | ✅ 0 errors (1 pre-existing warning in `tests/nova/chat-service.test.ts`) |
| `pnpm run check` | ✅ 0 errors, 0 warnings |
| `pnpm run test` | ✅ **793/793** (was 782; +11 new) |
| `pnpm run test:visual` | ✅ 21/21 (no visual changes in this stage) |

