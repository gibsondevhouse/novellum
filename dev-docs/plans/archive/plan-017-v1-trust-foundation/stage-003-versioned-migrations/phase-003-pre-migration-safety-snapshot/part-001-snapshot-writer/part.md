---
title: Snapshot Writer
slug: part-001-snapshot-writer
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-003-pre-migration-safety-snapshot
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Build a server-only module that writes a binary copy of the live SQLite DB to a snapshots folder and records the snapshot in `backup_snapshots`.

## Scope

**In scope:**

- `src/lib/server/db/snapshot.ts` exporting `writePreMigrationSnapshot(db, currentVersion)`.
- Resolves snapshots root via env (`NOVELLUM_SNAPSHOTS_DIR`) or defaults to `process.cwd()/.novellum-snapshots/`.
- Uses `db.backup(targetPath)` (better-sqlite3 online backup API).
- Inserts into `backup_snapshots` with `kind='pre-migration'`.

**Out of scope:**

- Restore flow (stage-004).
- App-data-path resolution (stage-006).

## Implementation Steps

1. Compute target path: `{root}/pre-migration-{ISO}-v{currentVersion}.sqlite`. Create root dir recursively.
2. `await db.backup(targetPath)` (better-sqlite3 returns a Promise).
3. Insert into `backup_snapshots` with id=`crypto.randomUUID()`, schema_version=currentVersion.
4. Return `{ id, path }`.

## Files

**Create:**

- `src/lib/server/db/snapshot.ts`

## Acceptance Criteria

- [ ] Unit test in `tests/sqlite/snapshot.test.ts` writes a snapshot, opens the snapshot DB read-only, and verifies row counts equal the source.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Target dir not writable: surface a clear error including the resolved path.
- Snapshot file already exists at the same ISO timestamp (low probability): append a short random suffix.
