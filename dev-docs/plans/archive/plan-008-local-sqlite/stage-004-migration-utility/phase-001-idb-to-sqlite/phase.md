---
title: IDB to SQLite Migration
slug: phase-001-idb-to-sqlite
phase_number: 1
status: draft
owner: Frontend Agent
stage: stage-004-migration-utility
parts:
  - part-001-migration-service
  - part-002-migration-ui
estimated_duration: 1d
---

## Goal

> Deliver the complete migration path: a service that reads all Dexie tables and writes them to SQLite via the API, and a settings page at `/settings/migrate` that walks the user through the one-time migration with a progress indicator and conflict warning.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Migration Service](part-001-migration-service/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [Migration UI](part-002-migration-ui/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] `MigrationService.migrate()` reads all 16 Dexie tables and posts each entity to the corresponding API endpoint
- [ ] Migration is safe to run on an empty Dexie DB (zero entities → zero API calls, success)
- [ ] Migration detects existing SQLite rows and shows a warning before proceeding
- [ ] `/settings/migrate` page shows per-table progress with entity counts
- [ ] Completion state shows total rows migrated and any errors
- [ ] `pnpm check` and `pnpm lint` pass

## Notes

> The migration service reads from Dexie directly (using the `AppDB` class) — this is the intended use case for keeping Dexie in place. It writes using the fetch API client functions, not the repository layer.
