---
title: Pre-Migration Safety Snapshot
slug: phase-003-pre-migration-safety-snapshot
phase_number: 3
status: draft
owner: Planner Agent
stage: stage-003-versioned-migrations
parts:
  - part-001-snapshot-writer
  - part-002-pre-migration-hook
estimated_duration: 0.75d
---

## Goal

Guarantee that no migration ever destroys a user's database: take a recoverable snapshot before any pending migration runs.

## Parts

| #   | Part                                                               | Status  | Assigned To | Est. Duration |
| --- | ------------------------------------------------------------------ | ------- | ----------- | ------------- |
| 001 | [Snapshot Writer](part-001-snapshot-writer/part.md)                | `draft` | backend     | 0.5d          |
| 002 | [Pre-Migration Hook](part-002-pre-migration-hook/part.md)          | `draft` | backend     | 0.25d         |

## Acceptance Criteria

- [ ] `src/lib/server/db/snapshot.ts` exposes `writePreMigrationSnapshot(db)` returning `{ id, path }` and registers it in `backup_snapshots`.
- [ ] Runner calls the snapshot writer before applying any pending migrations and skips when no migrations are pending.
- [ ] Snapshot path is rooted under the configured app data path (stage-006) — for now, fall back to `cwd()/.novellum-snapshots/`.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Use `db.backup(targetPath)` from better-sqlite3 (online backup API) — works without blocking writers.
- Snapshot file naming: `pre-migration-{ISO}-vNN.sqlite`.
