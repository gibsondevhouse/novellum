---
title: DB Singleton
slug: part-002-db-singleton
part_number: 2
status: draft
owner: Backend Agent
assigned_to: Backend Agent
phase: phase-002-server-db-module
started_at: ~
completed_at: ~
estimated_duration: 0.25d
---

## Objective

> Create a `SqliteDb` singleton that opens (or creates) the `novellum.db` file, enables WAL mode, runs migrations, and exports the typed `Database` instance for use by all API routes.

## Scope

**In scope:**

- `src/lib/server/db/client.ts` — singleton factory using module-level caching
- Read `NOVELLUM_DB_PATH` from `process.env` with default `./novellum.db`
- Enable WAL journal mode (`PRAGMA journal_mode = WAL`)
- Enable foreign key enforcement (`PRAGMA foreign_keys = ON`)
- Call `runMigrations(db)` immediately after open
- Export typed `db` instance

**Out of scope:**

- Connection pooling (not needed for SQLite single-file)
- In-memory DB for tests (handled at test layer, not here)

## Implementation Steps

1. Create `src/lib/server/db/client.ts`
2. Import `Database` from `better-sqlite3`
3. Resolve DB path: `const dbPath = process.env.NOVELLUM_DB_PATH ?? './novellum.db'`
4. Open DB: `const db = new Database(dbPath)`
5. Apply pragmas: `db.pragma('journal_mode = WAL')` and `db.pragma('foreign_keys = ON')`
6. Call `runMigrations(db)`
7. Export `db` as the default export and as a named export
8. Update `src/lib/server/db/index.ts` to also re-export `db` from `client.ts`

## Files

**Create:**

- `src/lib/server/db/client.ts`

**Update:**

- `src/lib/server/db/index.ts` — add re-export of `db` from `./client.js`

## Acceptance Criteria

- [ ] `novellum.db` is created on first import of `$lib/server/db`
- [ ] WAL mode enabled (verify via `PRAGMA journal_mode`)
- [ ] `runMigrations` is called exactly once at startup
- [ ] `db` is importable in any `+server.ts` file
- [ ] `pnpm check` passes on `client.ts`

## Edge Cases

- If the path directory does not exist (e.g. `NOVELLUM_DB_PATH=/data/app/novellum.db`), the open call will fail — document that the user must ensure the directory exists. For V1, default path `./novellum.db` is always valid.
- The singleton must NOT be imported from client-side Svelte components. It lives in `src/lib/server/` which SvelteKit's bundler restricts to server-only code.

## Notes

> Module-level singleton: `better-sqlite3` connections are synchronous and the singleton pattern (one module-level `const db = new Database(...)`) is the standard and safe approach for a single Node.js process. No locking concerns for local use.
