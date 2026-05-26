# Backend Context

## Data Architecture

Novellum uses a **dual-layer** data architecture:

1. **SQLite (Server-Side — Live Data):** A `better-sqlite3` database file (`novellum.db`) on the SvelteKit Node.js server. All browsers share this single database via REST API routes at `/api/db/*`.
2. **Dexie/IndexedDB (Browser — Portability Only):** Retained exclusively for the `.novellum.zip` export/import workflow (plan-006). Module repositories no longer read/write Dexie.

## SQLite Layer (`src/lib/server/db/`)

| File | Purpose |
| --- | --- |
| `client.ts` | Singleton `better-sqlite3` instance; WAL mode, foreign keys ON, auto-migrate |
| `schema.ts` | `SCHEMA_SQL` (16 tables) + `INDEX_SQL` (22 indexes) |
| `migrations.ts` | Runs schema + indexes inside a transaction |
| `serialize.ts` | `encodeJson` / `decodeJson` for JSON TEXT columns |
| `index.ts` | Barrel re-export |

Configuration:

- `NOVELLUM_DB_PATH` env var controls the database file location (default: `./novellum.db`)
- WAL journal mode for concurrent read performance
- Foreign keys enforced

## API Routes (`/api/db/*`)

All 16 entity types are exposed through REST routes under `src/routes/api/db/`. Each entity has:

- **Collection route** (`+server.ts`): GET (list with optional filters) + POST (create)
- **Item route** (`[id]/+server.ts`): GET + PUT + DELETE
- **Reorder route** (where applicable): PUT with `{ orderedIds }` body

JSON array fields (traits, goals, characterIds, locationIds, arcRefs, tags, entityIds, etc.) are stored as TEXT in SQLite and encoded/decoded at the API boundary via `serialize.ts`.

## Client Adapter (`src/lib/api-client.ts`)

Module repositories call a typed fetch wrapper instead of Dexie:

- `apiGet<T>(path, params?)` — GET with optional query params
- `apiPost<T>(path, body)` — POST with JSON body
- `apiPut<T>(path, body)` — PUT with JSON body
- `apiDel(path)` — DELETE (void return)
- `ApiError` — thrown on non-2xx responses, with `.status` property

## Dexie Preservation (Portability)

The Dexie `AppDB` class at `src/lib/db/index.ts` is preserved for:

- `.novellum.zip` export — reads all tables from Dexie
- `.novellum.zip` import — writes into Dexie with checksum verification
- One-time migration at `/settings/migrate` — reads Dexie, writes to SQLite via API

## Migration Utility (`src/lib/migration/`)

- `preCheck()` — returns per-table row counts from both Dexie and SQLite
- `migrate(callbacks)` — reads all Dexie tables and POSTs each entity to the API
- UI at `/settings/migrate` with progress tracking and conflict warnings
