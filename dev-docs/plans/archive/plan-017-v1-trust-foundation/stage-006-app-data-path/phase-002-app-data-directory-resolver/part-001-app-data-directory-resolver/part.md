---
title: App Data Directory Resolver
slug: part-001-app-data-directory-resolver
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-002-app-data-directory-resolver
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 1d
---

## Objective

Provide a single mode-aware module that owns the application data
directory and its subfolders (backups, logs), plus a creation helper
that applies restrictive POSIX permissions.

## Resolution Order (active app-data dir)

1. `NOVELLUM_APP_DATA_DIR` override.
2. Test mode (`VITEST=true` or `NODE_ENV=test`) → `${tmpdir()}/novellum-tests`.
   Tests that need isolation should still pass an override; the default
   exists only so import-time evaluation cannot blow up under Vitest.
3. Desktop mode (`NOVELLUM_PACKAGING_MODE=desktop` or
   `NODE_ENV=production`) → `resolveAppDataDirectory(env)` from
   `src/lib/server/db/path.ts` (OS-conventional).
4. Dev fallback → `${homedir()}/.novellum` (preserves the V0 secure-store
   location so existing `credentials.json` files keep loading).

## Files

**Create:**

- `src/lib/server/app-data/path.ts`
- `tests/db/app-data-path.test.ts`

**Update:**

- `src/lib/server/credentials/secure-store.ts` — drop the duplicate
  `resolveAppDataDir` and import the new resolver.

## Acceptance Criteria

- [x] Module exports `resolveAppDataDir`, `resolveBackupDirectory`,
      `resolveLogDirectory`, and `ensureAppDataDirectory`.
- [x] `ensureAppDataDirectory` creates the directory tree with
      `mkdir({ recursive: true })` and applies `chmod 0o700` on POSIX
      (Windows skips the chmod).
- [x] Secure-store imports the resolver and behaves identically for
      the existing `~/.novellum` dev path.
- [x] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- `getSecureStoreFileMode` continues to live in `secure-store.ts` —
  it is a credential-specific assertion helper.
