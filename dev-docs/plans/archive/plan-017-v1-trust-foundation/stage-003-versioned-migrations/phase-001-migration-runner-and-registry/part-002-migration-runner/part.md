---
title: Migration Runner
slug: part-002-migration-runner
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-001-migration-runner-and-registry
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Build a transactional, ordered, idempotent migration runner that executes pending migrations and records them in `schema_migrations`.

## Scope

**In scope:**

- `src/lib/server/db/migration-runner.ts` with:
  - `Migration = { version: number; name: string; up: (db: Database.Database) => void; checksum: string }`
  - `runMigrations(db, migrations: Migration[])` function.
- `MigrationVersionAheadError` exported from the same module.

**Out of scope:**

- Pre-migration snapshots (phase-003).
- Authoring individual migration files (phase-002 of stage).

## Implementation Steps

1. Create `migration-runner.ts`. Ensure `schema_migrations` exists (`CREATE TABLE IF NOT EXISTS`).
2. Read recorded versions; compute pending = migrations sorted by `version` whose version is unrecorded.
3. Refuse to proceed if `max(recordedVersion) > max(bundledVersion)` — throw `MigrationVersionAheadError` with recovery instructions.
4. For each pending migration: `BEGIN IMMEDIATE`, call `up(db)`, insert row into `schema_migrations`, `COMMIT`. On error: rollback and rethrow with context (`{ version, name, cause }`).
5. Export helper `getAppliedMigrations(db)` for diagnostics.

## Files

**Create:**

- `src/lib/server/db/migration-runner.ts`

## Acceptance Criteria

- [ ] Unit tests in `tests/sqlite/migrations/runner.test.ts` cover: empty DB → applies all; partial DB → applies only pending; idempotent re-run → no-op; rollback on failure leaves no row inserted; ahead-of-bundled → throws.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Migrations array contains a duplicate version: throw at module load time.
- A migration's `up()` mutates schema then throws: rollback must restore prior schema state (verify via PRAGMA).

## Notes

- Use `db.transaction(...)` from better-sqlite3 with `BEGIN IMMEDIATE` semantics or run raw `BEGIN IMMEDIATE`.
