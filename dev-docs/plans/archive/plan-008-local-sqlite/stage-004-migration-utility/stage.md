---
title: Migration Utility
slug: stage-004-migration-utility
stage_number: 4
status: draft
owner: Frontend Agent
plan: plan-008-local-sqlite
phases:
  - phase-001-idb-to-sqlite
estimated_duration: 1d
risk_level: medium
---

## Goal

> Build a one-time IndexedDB → SQLite migration utility that reads all existing Dexie data from the current browser and posts it to the SQLite server — giving users with existing browser data a safe upgrade path without data loss.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [IDB to SQLite Migration](phase-001-idb-to-sqlite/phase.md) | `draft` | 1d |

## Entry Criteria

- Stage 003 is `complete`
- All repositories are connected to SQLite via API
- SQLite DB is live and accepting writes

## Exit Criteria

- All phases in this stage are `complete`
- Migration page is accessible at `/settings/migrate`
- Migration can be run safely on a fresh Dexie database (no data → no-op)
- Migration detects existing SQLite data and warns before overwriting
- Migration is idempotent: running it twice does not corrupt data

## Notes

> This stage is a user-facing upgrade path for the transition period. Once all users have migrated and IndexedDB data is confirmed gone, the migration UI can be hidden or removed in a future cleanup plan.
>
> The migration does NOT delete IndexedDB data after completion — it leaves Dexie intact. Users can verify SQLite data is correct before trusting it.
