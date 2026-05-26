---
title: Restore Service
slug: part-001-restore-service
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-004-restore-execution-transactional
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Implement the restore-over-existing path: replace all rows for the given `projectId` across every registered table, inside one transaction.

## Scope

**In scope:**

- `src/lib/server/restore/restore-project.ts` exposing `restoreProject(db, parsed, mode: 'overwrite'): RestoreResult`.

**Out of scope:**

- restore-as-copy (sibling part-002).
- HTTP handler (sibling part-003).

## Implementation Steps

1. Take a pre-restore snapshot via `writePreMigrationSnapshot(db, schemaVersion, { kind: 'pre-restore' })` — extend the snapshot writer to accept `kind` if necessary.
2. Open `BEGIN IMMEDIATE`.
3. For each registered project table in **child-before-parent inverted order** (because `projects` has FK children), `DELETE` all rows for the target project id.
4. For each registered table in **parent-before-child order**, `INSERT` the rows from the parsed backup.
5. `COMMIT`. On any throw, `ROLLBACK` and return a structured `RestoreResult` with `ok: false`, error code, and snapshot path.
6. Add `tests/backup/project-restore.test.ts` — overwrite branch:
   - Seed project A. Build backup. Mutate project A. Restore. Assert row equality with the seeded state.
   - Inject a failing INSERT (e.g. via FK violation) and assert the DB is unchanged after rollback.

## Files

**Create:**

- `src/lib/server/restore/restore-project.ts`
- `tests/backup/project-restore.test.ts`

**Update:**

- `src/lib/server/db/snapshot.ts` — accept optional `kind` (default `'pre-migration'`).

## Acceptance Criteria

- [ ] Restore is atomic: any error → rollback, snapshot row written for forensic recovery.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Backup contains rows for a different project id than `projectId` — refuse with `project_id_mismatch`.
- Backup table missing from registry — refuse unless explicitly opted into via `acceptUnknownTables: true`.

## Notes

- Use `db.transaction(() => { ... })` from better-sqlite3 if appropriate, or manual `BEGIN IMMEDIATE` to match the migration runner's idiom.
