---
title: Pre-Migration Hook
slug: part-002-pre-migration-hook
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-003-pre-migration-safety-snapshot
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Wire `writePreMigrationSnapshot` into the migration runner so a snapshot is captured before any pending migrations run, but skipped when there are none.

## Scope

**In scope:**

- Update `src/lib/server/db/migration-runner.ts` to call the snapshot writer when `pending.length > 0`.
- Pass the snapshot id/path into the migration error message if a migration fails.

**Out of scope:**

- Snapshot rotation/cleanup (deferred to stage-004 or later).

## Implementation Steps

1. Resolve current schema version (`max(version) FROM schema_migrations`) before iterating pending migrations.
2. If pending non-empty, call `await writePreMigrationSnapshot(db, currentVersion)`.
3. If a migration throws, augment the rethrown error with the snapshot path.

## Files

**Update:**

- `src/lib/server/db/migration-runner.ts`

## Acceptance Criteria

- [ ] Test confirms: pending=0 → no snapshot file created; pending>0 → exactly one snapshot file created and one `backup_snapshots` row inserted.
- [ ] Test confirms: migration failure surface includes `snapshotPath` in error.cause.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
