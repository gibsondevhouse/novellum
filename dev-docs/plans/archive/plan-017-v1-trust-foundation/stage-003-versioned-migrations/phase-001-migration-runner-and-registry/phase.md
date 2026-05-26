---
title: Migration Runner and Registry
slug: phase-001-migration-runner-and-registry
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-003-versioned-migrations
parts:
  - part-001-schema-migrations-table
  - part-002-migration-runner
  - part-003-startup-integration
estimated_duration: 1d
---

## Goal

Introduce a `schema_migrations` registry table and a transactional, ordered, idempotent migration runner that replaces ad-hoc `ensureColumn` logic at startup.

## Parts

| #   | Part                                                                                  | Status  | Assigned To | Est. Duration |
| --- | ------------------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [schema_migrations Table](part-001-schema-migrations-table/part.md)                   | `draft` | backend     | 0.25d         |
| 002 | [Migration Runner](part-002-migration-runner/part.md)                                 | `draft` | backend     | 0.5d          |
| 003 | [Startup Integration](part-003-startup-integration/part.md)                           | `draft` | backend     | 0.25d         |

## Acceptance Criteria

- [ ] `schema_migrations(version INTEGER PK, name TEXT, applied_at TEXT, checksum TEXT, app_version TEXT)` exists.
- [ ] `src/lib/server/db/migration-runner.ts` exports `runMigrations(db, migrations)` that executes pending migrations in `BEGIN IMMEDIATE` transactions, recording each on success.
- [ ] Runner refuses to open a DB whose recorded max version exceeds the bundled max, surfacing a clear `MigrationVersionAheadError`.
- [ ] Startup path calls runner; lint/check/test all green.

## Notes

- Use `better-sqlite3`. Each migration is `(db) => void` plus metadata.
- Checksum is SHA-256 of the migration file source (or its stable id+steps).
