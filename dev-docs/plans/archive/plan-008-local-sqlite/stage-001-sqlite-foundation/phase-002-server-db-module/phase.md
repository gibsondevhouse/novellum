---
title: Server DB Module
slug: phase-002-server-db-module
phase_number: 2
status: draft
owner: Backend Agent
stage: stage-001-sqlite-foundation
parts:
  - part-001-sqlite-schema-and-migrations
  - part-002-db-singleton
estimated_duration: 0.5d
---

## Goal

> Build the server-side SQLite module at `src/lib/server/db/` — defining the full entity schema in DDL, a migration runner that auto-upgrades on server start, and a typed `SqliteDb` singleton exported for use by all API routes.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [SQLite Schema and Migrations](part-001-sqlite-schema-and-migrations/part.md) | `draft` | Backend Agent | 0.25d |
| 002 | [DB Singleton](part-002-db-singleton/part.md) | `draft` | Backend Agent | 0.25d |

## Acceptance Criteria

- [ ] All 16 entity tables created with correct columns and indexes
- [ ] JSON array fields use TEXT columns with runtime (de)serialization
- [ ] Migration runner applies schema on first start; is idempotent on subsequent starts
- [ ] `novellum.db` created at configured path on first import
- [ ] `SqliteDb` singleton is importable from `$lib/server/db`
- [ ] No Dexie imports in any file under `src/lib/server/`

## Notes

> SQLite does not have an array column type. All fields typed as `string[]` in the Dexie entity interfaces (e.g. `traits`, `goals`, `flaws`, `tags`, `characterIds`) must be stored as JSON text and deserialized at the repository boundary. A shared `serialize.ts` utility handles this to avoid duplication.
