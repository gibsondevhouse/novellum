# Dexie Boundary Audit — 2026-06-04

## Summary

All Dexie imports were audited. All usages are either within the intentional legacy/migration/portability boundary or are a single known exception documented below.

## Boundary-scoped files (intentional — do not modify)

| File | Category | Notes |
| --- | --- | --- |
| `src/lib/legacy/dexie/db.ts` | Legacy layer | Core Dexie DB — frozen, "New code MUST NOT import from this module" |
| `src/lib/legacy/dexie/schema.ts` | Legacy layer | Schema definitions — frozen |
| `src/lib/legacy/dexie/db-alias.ts` | Legacy layer | Alias re-export — frozen |
| `src/lib/migration/migration-service.ts` | Migration | Reads Dexie tables to migrate records to SQLite |
| `src/lib/migration/types.ts` | Migration | `dexieCount` field in migration status type |
| `src/routes/settings/migrate/evidence-log.ts` | Migration UI | Types for migration evidence log view |
| `src/modules/outline/services/migrations/outline-to-story-workspace.ts` | Migration | One-time outline schema migration |
| `src/modules/export/services/portability/snapshot-service.ts` | Portability | Snapshot service reads Dexie for export |
| `src/modules/export/services/portability/restore-service.ts` | Portability | Restore service writes Dexie for import |
| `src/hooks.server.ts` | Comment only | References `migration.dexieToSqlite.completedAt` key — no import |
| `src/lib/db/domain-types.ts` | Comment only | States "no Dexie" — no import |

## Known exception — assets module

**File:** `src/modules/assets/stores/assets.svelte.ts`

**Import:** `import { db, type Asset } from '$lib/legacy/dexie/db'`

**Classification:** Live application code outside the migration/portability boundary — boundary violation.

**Why not fixed in this plan:**  
The assets module stores image/file assets in Dexie (IndexedDB) because there is no SQLite table or API for assets yet. Migrating this requires:
1. An `assets` table in the SQLite schema + migration runner entry
2. CRUD API routes under `/api/db/assets/`
3. Rewriting `assets.svelte.ts` to use fetch-based API calls

This is a full feature migration with a multi-day scope, outside the 0.5d estimate for Stage 004. It should be tracked as a dedicated follow-up plan.

**Used by:**
- `src/modules/assets/components/ImageGrid.svelte`
- `src/routes/projects/[id]/world-building/factions/+page.svelte`
- `src/routes/projects/[id]/world-building/lineages/+page.svelte`
- `src/routes/projects/[id]/world-building/characters/individuals/+page.svelte`

## Test files (informational, no boundary impact)

| File | Notes |
| --- | --- |
| `src/modules/export/services/__tests__/snapshot-service.test.ts` | Tests portability boundary — expected |
| `src/modules/export/services/__tests__/zip-import-parse.test.ts` | Tests portability boundary — expected |
| `src/modules/export/services/__tests__/zip-export.test.ts` | Tests portability boundary — expected |

## Verdict

The Dexie boundary is correctly maintained except for the assets module, which is a documented exception requiring a dedicated migration plan. All other Dexie usage is within the expected legacy/migration/portability scope.
