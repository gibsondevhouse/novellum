---
title: SQLite Schema and Migrations
slug: part-001-sqlite-schema-and-migrations
part_number: 1
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-server-db-module
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

> Define the full SQLite DDL schema for all 16 entity tables mirroring the Dexie V8 schema, and write a migration runner that creates missing tables on server start (idempotent, `IF NOT EXISTS`).

## Scope

**In scope:**

- DDL CREATE TABLE statements for all 16 entity tables
- `serialize.ts` utility for JSON array field encode/decode
- `migrations.ts` runner that applies DDL using `CREATE TABLE IF NOT EXISTS`
- Matching all column types and nullable constraints from `src/lib/db/types.ts`

**Out of scope:**

- Any ORM or query builder layer
- Schema versioning beyond `IF NOT EXISTS` (V1 is append-only DDL)
- Indexes beyond primary key and projectId foreign key indexes

## Implementation Steps

1. Create `src/lib/server/db/` directory
2. Create `src/lib/server/db/serialize.ts` — exports `encodeJson(val: unknown): string` and `decodeJson<T>(val: string | null | undefined): T`
3. Create `src/lib/server/db/schema.ts` — defines `TABLES` as an array of DDL strings (one per table), covering all 16 tables:
   - `projects`, `chapters`, `scenes`, `beats`
   - `characters`, `character_relationships`, `locations`
   - `lore_entries`, `plot_threads`, `timeline_events`
   - `consistency_issues`, `export_settings`, `scene_snapshots`
   - `story_frames`, `acts`, `arcs`
4. For each table: use `TEXT NOT NULL` for string fields, `INTEGER` for numbers, `TEXT` for JSON-encoded arrays, `TEXT` for nullable string fields (no `NOT NULL`)
5. Add `CREATE INDEX IF NOT EXISTS idx_[table]_projectId ON [table](projectId)` for all tables that have a `projectId` column
6. Create `src/lib/server/db/migrations.ts` — exports `runMigrations(db: Database)` that iterates `TABLES` and executes each DDL statement
7. Add `src/lib/server/db/index.ts` — re-exports `serialize.ts` and `migrations.ts`

## Files

**Create:**

- `src/lib/server/db/serialize.ts`
- `src/lib/server/db/schema.ts`
- `src/lib/server/db/migrations.ts`
- `src/lib/server/db/index.ts`

## Acceptance Criteria

- [ ] All 16 tables defined in `schema.ts`
- [ ] Every `string[]` field in `types.ts` has a corresponding `TEXT` column (JSON-encoded)
- [ ] `runMigrations` executes without error on a fresh database
- [ ] `runMigrations` is idempotent — running twice does not throw
- [ ] `serialize.ts` handles `null`/`undefined` input gracefully (returns `'[]'` for null arrays)
- [ ] `pnpm check` passes on new files

## Edge Cases

- `arcs` field on `Character` is `string[]` (same name as the `arcs` table — take care to avoid name collision in variable scope)
- `arcRefs` on `Chapter` and `Scene` is `ArcRef[]` (array of objects) — stored as JSON TEXT
- `characterIds` and `locationIds` on `Scene` are `string[]` — stored as JSON TEXT
- Optional fields (e.g. `actId?: string`) map to nullable TEXT columns

## Notes

> Keep migrations strictly additive (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`). Never use `DROP TABLE` or `ALTER TABLE` in V1. Future schema changes will add new migration steps.
