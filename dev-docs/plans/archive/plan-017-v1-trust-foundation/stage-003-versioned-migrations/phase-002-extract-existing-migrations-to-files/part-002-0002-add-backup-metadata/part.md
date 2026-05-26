---
title: 0002 Add Backup Metadata
slug: part-002-0002-add-backup-metadata
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-002-extract-existing-migrations-to-files
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Author migration `0002_add_backup_metadata.ts` that creates the `backup_snapshots` registry consumed by phase-003 (pre-migration snapshot writer) and stage-004 (Backup & Restore).

## Scope

**In scope:**

- New file `src/lib/server/db/migrations/0002_add_backup_metadata.ts`.
- Table `backup_snapshots`: `id TEXT PRIMARY KEY, kind TEXT NOT NULL, created_at TEXT NOT NULL, path TEXT NOT NULL, app_version TEXT NOT NULL DEFAULT '', schema_version INTEGER NOT NULL DEFAULT 0, note TEXT NOT NULL DEFAULT ''`.
- Index on `(kind, created_at DESC)`.
- Register in `MIGRATION_REGISTRY` after `0001_baseline`.

**Out of scope:**

- `SCHEMA_SQL` is **not** updated; the migration owns the table.
- The actual snapshot writer is phase-003 part-001.

## Implementation Steps

1. Create the file with `up()` running `CREATE TABLE IF NOT EXISTS backup_snapshots (...)` and `CREATE INDEX IF NOT EXISTS`.
2. Add to `MIGRATION_REGISTRY`.

## Files

**Create:**

- `src/lib/server/db/migrations/0002_add_backup_metadata.ts`

**Update:**

- `src/lib/server/db/migration-registry.ts`

## Acceptance Criteria

- [ ] On a fresh DB after migrations 1 and 2, `backup_snapshots` exists with the declared columns and index.
- [ ] Idempotent: re-running on a DB that already has the table is a no-op.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
