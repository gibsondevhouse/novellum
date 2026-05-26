---
title: Migration Engine
slug: part-001-migration-engine
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-004-indexeddb-to-sqlite-migration-ui
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Implement the table-by-table Dexie → SQLite migration engine as a pure module returning per-table results and an evidence log.

## Scope

**In scope:**

- New module: `src/lib/migration/dexie-to-sqlite.ts` exporting:
  - `runDexieToSqliteMigration({ onProgress }): Promise<MigrationReport>`
  - `MigrationReport` containing per-table `{ table, migrated, skipped, failed, errors[] }`.
- Per-table handlers that:
  1. Read all rows from the Dexie table (`$lib/legacy/dexie/db`).
  2. Skip rows whose primary key already exists in SQLite (idempotency).
  3. POST batched payloads to the appropriate `/api/db/*` route.
  4. Append a row to the evidence log: `{ table, id, action: 'migrated' | 'skipped' | 'failed', error? }`.
- A `migration_complete` marker stored in `app_preferences` (key: `migration.dexieToSqlite.completedAt`).

**Out of scope:**

- The migration page UI — part-002.
- Conflict resolution beyond idempotency (last-write-wins is fine for V1).

## Implementation Steps

1. Define the `MigrationReport` and `EvidenceLogEntry` types.
2. Build a per-table handler registry mapping Dexie table name → API route + payload mapper.
3. Implement the engine:
   - Read marker first; if set, return a no-op report.
   - For each registered table: stream rows, batch POST (chunk size 50), update progress.
   - On completion, write the `migration_complete` marker.
4. Vitest: unit tests using `fake-indexeddb` to seed a Dexie store, run the engine, assert SQLite endpoints were called with the right payloads.
5. Vitest: idempotency test — run twice, confirm second run returns immediately.

## Files

**Create:**

- `src/lib/migration/dexie-to-sqlite.ts`
- `tests/lib/dexie-to-sqlite-migration.test.ts`

## Acceptance Criteria

- [ ] Engine handles every project-owned Dexie table.
- [ ] Idempotency test passes (second run is no-op).
- [ ] Evidence log entries are produced for every row.
- [ ] `pnpm run test` passes.

## Edge Cases

- Dexie row with FK pointing to a project that does not exist in SQLite → log as `failed` with reason "missing parent project"; do not abort.
- Network error mid-batch → log every row in the batch as `failed`; engine continues with the next batch.
- Schema drift between Dexie row shape and SQLite payload → payload mapper normalizes; log unmapped fields once per table.

## Notes

- The engine is the only V1 module (besides the migration page) allowed to import `$lib/legacy/dexie/*`.
