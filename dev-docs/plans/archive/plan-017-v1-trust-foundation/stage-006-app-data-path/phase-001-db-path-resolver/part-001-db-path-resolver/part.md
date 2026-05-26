---
title: DB Path Resolver
slug: part-001-db-path-resolver
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-001-db-path-resolver
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Extract the SQLite database path decision into a single, testable resolver
so dev / test / desktop modes pick predictable locations and `client.ts`
no longer hard-codes the path.

## Scope

**In scope:**

- New module `src/lib/server/db/path.ts` exporting:
  - `resolveDatabasePath(env?: NodeJS.ProcessEnv): string`
  - `resolveAppDataDirectory(env?: NodeJS.ProcessEnv): string` (shared
    helper used by phase-002 too)
- Refactor `src/lib/server/db/client.ts` to call `resolveDatabasePath()`.
- Vitest suite at `tests/db/db-path.test.ts`.

**Out of scope:**

- Moving credentials over to the resolver (phase-002).
- Backups / logs paths beyond DB (phase-002).
- The `/api/settings/storage-location` route (phase-003).

## Resolution Order

1. **Explicit override** — `env.NOVELLUM_DB_PATH` wins everywhere. Dev,
   test, and desktop are all overridable for fixtures.
2. **Test mode** — `env.VITEST === 'true'` → `:memory:`.
3. **Desktop mode** — `env.NOVELLUM_PACKAGING_MODE === 'desktop'`
   (preferred) **or** `env.NODE_ENV === 'production'` (soft fallback)
   → OS-conventional path:
   - macOS: `~/Library/Application Support/Novellum/novellum.db`
   - Windows: `%APPDATA%/Novellum/novellum.db`
     (falls back to `~/AppData/Roaming/Novellum/novellum.db` if `APPDATA`
     is unset)
   - Linux/other: `~/.local/share/Novellum/novellum.db`
4. **Dev fallback** — `./novellum.db`.

## Acceptance Criteria

- [x] `path.ts` is pure (no I/O at import time).
- [x] `client.ts` imports the resolver and passes the resolved string to
      `new Database(...)`.
- [x] `tests/db/db-path.test.ts` covers each branch + the override.
- [x] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- `:memory:` is intentionally chosen over a temp-dir file in test mode
  because the existing test setup expects synchronous, isolated
  databases and currently many tests pass `':memory:'` directly to
  `new Database()`. The resolver only produces the string; choosing to
  call it is left to the test itself.
