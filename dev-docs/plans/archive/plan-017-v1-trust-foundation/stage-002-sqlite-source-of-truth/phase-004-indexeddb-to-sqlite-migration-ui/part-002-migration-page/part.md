---
title: Migration Page
slug: part-002-migration-page
part_number: 2
status: complete
owner: architect
assigned_to: architect
phase: phase-004-indexeddb-to-sqlite-migration-ui
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Provide the user-facing `/settings/migrate` page that runs the migration engine, shows progress, and lets the user download the evidence log.

## Scope

**In scope:**

- New route: `src/routes/settings/migrate/+page.svelte`.
- UI states: `idle` (show "Migrate from local browser DB" CTA), `running` (per-table progress bars), `complete` (summary + download log button), `already-complete` (banner showing previous completion timestamp).
- Use Svelte 5 Runes (`$state`, `$derived`).
- Download evidence log as JSON via Blob URL.
- Surface a discoverable link from `/settings/+page.svelte` (existing settings shell).

**Out of scope:**

- Engine internals — part-001.
- Telemetry beyond what the engine already logs.

## Implementation Steps

1. Create the route shell with the four UI states.
2. On mount, check the `migration_complete` marker via the preferences API; set state accordingly.
3. CTA wires to the engine with `onProgress` callback updating component state.
4. On completion, render summary and a "Download evidence log" button.
5. Add a settings page link.
6. Visual snapshot test (Playwright or Vitest visual) for the four states.

## Files

**Create:**

- `src/routes/settings/migrate/+page.svelte`
- `tests/routes/settings-migrate.test.ts` (component test)

**Update:**

- `src/routes/settings/+page.svelte` — add link to `/settings/migrate`.

## Acceptance Criteria

- [ ] All four UI states render correctly.
- [ ] Clicking "Migrate" runs the engine and updates progress without locking up the UI.
- [ ] Evidence log downloads as a valid JSON file.
- [ ] Page passes accessibility audit (focus order, keyboard activation, ARIA live region for progress).
- [ ] `pnpm run lint`, `pnpm run check`, `pnpm run test` pass.

## Edge Cases

- Migration is started, then the user navigates away. The engine must continue but the UI must not break on remount; rely on the marker to determine state.
- Browser without IndexedDB support — show a friendly "no legacy data detected" state instead of erroring.

## Notes

- This page is the only V1 UI route allowed to import `$lib/legacy/dexie/*`.
