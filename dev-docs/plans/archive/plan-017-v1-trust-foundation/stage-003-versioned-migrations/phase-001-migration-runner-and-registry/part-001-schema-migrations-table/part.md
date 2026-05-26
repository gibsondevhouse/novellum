---
title: schema_migrations Table
slug: part-001-schema-migrations-table
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-001-migration-runner-and-registry
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Add a `schema_migrations` registry table to the canonical schema so the runner has a place to record applied migrations.

## Scope

**In scope:**

- `schema_migrations` table DDL added to `src/lib/server/db/schema.ts`.
- Index on `version` (PK already implies it; document only).

**Out of scope:**

- Runner logic (part-002).
- Backfilling rows for legacy DBs (handled by part-003 startup integration).

## Implementation Steps

1. Append `schema_migrations` to `SCHEMA_SQL` in `src/lib/server/db/schema.ts`:
   - `version INTEGER PRIMARY KEY`
   - `name TEXT NOT NULL`
   - `applied_at TEXT NOT NULL` (ISO 8601)
   - `checksum TEXT NOT NULL`
   - `app_version TEXT NOT NULL DEFAULT ''`
2. Update tests under `tests/sqlite/` that snapshot the schema if any.

## Files

**Update:**

- `src/lib/server/db/schema.ts`

## Acceptance Criteria

- [ ] Table created on a fresh DB; `pragma table_info(schema_migrations)` returns the five columns with the right types.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Existing user DBs lack the table; the startup integration (part-003) must `CREATE TABLE IF NOT EXISTS` before consulting it.
