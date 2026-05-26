---
title: App Preferences Store
slug: part-003-app-preferences-store
part_number: 3
status: complete
owner: backend
assigned_to: backend
phase: phase-002-localstorage-audit-and-migration
started_at: 2025-01-09
completed_at: 2025-01-09
estimated_duration: 0.5d
---

## Objective

Introduce a single `app_preferences` SQLite table with a typed key/value preferences service and migrate every `app-preference`-classified `localStorage` call site (per the audit) onto it.

## Scope

**In scope:**

- New table: `app_preferences (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL)`.
- New service: `src/lib/server/preferences/preferences-service.ts` with `getPreference<T>(key)` / `setPreference<T>(key, value)`.
- New routes: `GET/PUT /api/db/preferences/[key]`.
- Client wrapper: `src/lib/preferences.ts` (or `src/lib/preferences/index.ts`) returning a small typed helper used in components.
- Refactor each `app-preference` site (e.g. selected model, last-opened project, sidebar collapsed state).

**Out of scope:**

- Encrypting any preference values — credential storage is stage-005.
- Cross-device sync.

## Implementation Steps

1. Add `app_preferences` table DDL to `src/lib/server/db/schema.ts`.
2. Implement the preferences service and routes.
3. Implement the client wrapper as a thin fetch-based helper (`getPreference`, `setPreference`).
4. Refactor each app-preference call site identified by the audit.
5. Vitest: unit tests for service; route test for round-trip GET/PUT.

## Files

**Create:**

- `src/lib/server/preferences/preferences-service.ts`
- `src/routes/api/db/preferences/[key]/+server.ts`
- `src/lib/preferences.ts`
- `tests/lib/preferences-service.test.ts`

**Update:**

- `src/lib/server/db/schema.ts`
- All app-preference call sites identified by the audit.

## Acceptance Criteria

- [ ] No `localStorage` reads or writes remain for app preferences (excluding the explicitly-allowed legacy-portability sites).
- [ ] Round-trip test: setting a preference, refreshing the page, the value is read from SQLite.
- [ ] `pnpm run lint`, `pnpm run check`, `pnpm run test` all pass.

## Edge Cases

- Preferences accessed during SSR must short-circuit safely (return defaults) before hydration.
- Missing keys return `undefined` (not throw); the helper accepts a `defaultValue` parameter.

## Notes

- API key storage is **not** a preference — it lives in a separate secure store introduced in stage-005.
