---
title: Versioned Migrations
slug: stage-003-versioned-migrations
stage_number: 3
status: complete
owner: Planner Agent
plan: plan-017-v1-trust-foundation
phases:
  - phase-001-migration-runner-and-registry
  - phase-002-extract-existing-migrations-to-files
  - phase-003-pre-migration-safety-snapshot
  - phase-004-migration-test-matrix
estimated_duration: 4d
risk_level: medium
---

## Goal

Replace ad-hoc `ensureColumn`/backfill logic with an explicit, ordered, idempotent SQLite migration runner backed by a `schema_migrations` registry. Migration failure must never destroy a user database.

## Phases

| #   | Phase                                                                                                                       | Status  | Est. Duration |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Migration Runner and Registry](phase-001-migration-runner-and-registry/phase.md)                                           | `complete` | 1d            |
| 002 | [Extract Existing Migrations to Files](phase-002-extract-existing-migrations-to-files/phase.md)                             | `complete` | 1.5d          |
| 003 | [Pre-Migration Safety Snapshot](phase-003-pre-migration-safety-snapshot/phase.md)                                           | `complete` | 0.75d         |
| 004 | [Migration Test Matrix](phase-004-migration-test-matrix/phase.md)                                                           | `complete` | 0.75d         |

## Entry Criteria

- Stage 002 complete (canonical SQLite schema declared).
- Snapshot of the live `migrations.ts` ad-hoc logic captured for reference.

## Exit Criteria

- `src/lib/server/db/migration-runner.ts` applies ordered migrations inside transactions, recording `{version, name, appliedAt}` in `schema_migrations`.
- Initial migration files exist under `src/lib/server/db/migrations/`:
  - `0001_baseline.ts` (collapsed; supersedes the suggested `0001_initial`/`0002_add_story_structure`/`0003_add_ai_tables` split — see phase-002/phase.md "Decision: collapse to a baseline + backup_metadata").
  - `0002_add_backup_metadata.ts`
- Pre-migration auto-snapshot writes a copy of the DB (or a row-level snapshot) before any migration that mutates schema.
- App refuses to open a DB whose `schema_migrations.version` exceeds the bundled max with a clear error and recovery instructions.
- Test matrix passes:
  - `tests/sqlite/migrations/from-empty.test.ts`
  - `tests/sqlite/migrations/from-v1.test.ts`
  - `tests/sqlite/migrations/idempotent.test.ts`
- `src/lib/server/db/migrations.ts` retains only delegation to the runner; no inline `ensureColumn` calls remain in product code paths.

## Notes

- Source: [market-readiness-pt1.md §9](../../research/market-readiness-pt1.md).
- Use `better-sqlite3` transactions; `BEGIN IMMEDIATE` on each migration.
- Record both the migration set's checksum and the app version in `schema_migrations` for forensic value.
