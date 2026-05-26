---
title: Migration Service
slug: part-001-migration-service
part_number: 1
status: draft
owner: Frontend Agent
assigned_to: Frontend Agent
phase: phase-001-idb-to-sqlite
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Build `MigrationService` at `src/lib/migration/migration-service.ts` that reads every entity from the Dexie `AppDB` instance and upserts it into the SQLite store via the `/api/db/*` API endpoints — reporting progress per table for the migration UI.

## Scope

**In scope:**

- Read all records from all 16 Dexie tables using `db.[table].toArray()`
- For each entity: POST to the corresponding `/api/db/*` endpoint (use `INSERT OR REPLACE` semantics at the API level — idempotent)
- Progress callbacks: `onTableStart(tableName, count)`, `onTableComplete(tableName, migratedCount, errorCount)`, `onError(tableName, entityId, error)`
- A `preCheck()` method that returns the row count in SQLite for each table (used by UI to warn about existing data)
- Return a `MigrationResult` summary: `{ tablesProcessed, rowsMigrated, errors }`

**Out of scope:**

- Conflict resolution logic (V1: always overwrite — SQLite API uses upsert)
- Streaming or chunked migration (V1: load entire table into memory)
- Rollback on partial failure

## Implementation Steps

1. Create `src/lib/migration/` directory
2. Create `src/lib/migration/types.ts` — define `MigrationResult`, `TableProgress`, progress callback types
3. Create `src/lib/migration/migration-service.ts`
4. Import `db` from `$lib/db` (Dexie instance)
5. Define `MIGRATION_TABLES` array matching Dexie table names and their API endpoint paths
6. Implement `preCheck()`: fetch `GET /api/db/[table]?limit=1` (or use a count endpoint) for each table to detect existing data
7. Implement `migrate(callbacks)`:
   - For each table: call `db.[table].toArray()`
   - For each entity: call `POST /api/db/[table]` with the entity (server uses upsert)
   - Track success/failure counts
   - Fire progress callbacks
8. Export `MigrationService` class with `preCheck()` and `migrate()` methods

## Files

**Create:**

- `src/lib/migration/types.ts`
- `src/lib/migration/migration-service.ts`
- `src/lib/migration/index.ts`

## Acceptance Criteria

- [ ] `MigrationService.migrate()` returns `MigrationResult` with accurate counts
- [ ] Empty Dexie DB: `migrate()` completes with `rowsMigrated: 0`, no errors
- [ ] `preCheck()` returns per-table SQLite row counts (0 if empty)
- [ ] Progress callbacks fire once per table start and once per table completion
- [ ] Entity-level errors are caught and counted, not thrown (migration continues despite individual entity errors)
- [ ] `pnpm check` passes

## Edge Cases

- `scene_snapshots` may have a large number of rows — process in same batch as other tables (no special handling in V1)
- `export_settings` POST must use upsert (POST with same `projectId` should not create a duplicate row)
- Entities with null optional fields must not cause API validation failures — confirm null handling at API boundary

## Notes

> The `MIGRATION_TABLES` map must cover all 16 tables in dependency order: `projects` first (many other tables reference `projectId`), content and bible tables after, auxiliary tables last.
