---
title: Backup Builder
slug: part-002-backup-builder
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-002-backup-builder-and-checksums
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.75d
---

## Objective

Read every project-owned row from SQLite, serialize it into `db/<table>.json` files, build the manifest with real row counts, generate `checksums.json`, and emit the assembled `.novellum` ZIP buffer.

## Scope

**In scope:**

- `src/lib/server/backup/build-project-backup.ts` exposing `buildProjectBackup(db, projectId): { archive: Uint8Array; manifest: BackupManifest; filename: string }`.

**Out of scope:**

- HTTP layer (sibling part-003).
- Restore (phase-003/004).

## Implementation Steps

1. Use the registry from phase-001 to drive the table loop. For each `include: true` entry:
   - Root table (`projects`): select the row by `id = ?`. Throw if missing.
   - Child tables: select rows where `<projectIdColumn> = ?`. If a table is project-scoped via a join (e.g. scenes via chapter), the registry entry must declare a SQL fragment or a resolver — keep this explicit.
2. Serialize each table to `db/<table>.json` with stable key ordering (`Object.keys().sort()` per row) so checksums are stable across runs.
3. Build the manifest via `buildManifest(...)` with `tableCounts` populated from the actual row counts; `schemaVersion` from `Math.max(...MIGRATION_REGISTRY.map(m => m.version))`.
4. Produce `checksums.json` containing every `db/*.json` file plus `manifest.json` itself (with manifest checksum computed last over the canonical JSON form).
5. Build the ZIP using `fflate` (already a likely dep — verify; otherwise add). Filename: `<slugified-title>_<YYYY-MM-DD>.novellum`.
6. Add `tests/backup/project-backup.test.ts`:
   - Seed a project with rows in every project-owned table.
   - Build a backup; parse the ZIP back; assert every registered table file exists, manifest counts match, checksums verify.
7. Add `tests/backup/credential-exclusion.test.ts`:
   - Insert any credential-shaped rows currently in scope (e.g. settings rows containing `apiKey`); assert the backup archive contains zero matches for the secret value.

## Files

**Create:**

- `src/lib/server/backup/build-project-backup.ts`
- `tests/backup/project-backup.test.ts`
- `tests/backup/credential-exclusion.test.ts`

## Acceptance Criteria

- [ ] Backup is built entirely from SQLite (no Dexie imports allowed in this file).
- [ ] Every `include: true` table appears as a `db/<table>.json` file.
- [ ] `manifest.json.tables[name]` equals the JSON file row count.
- [ ] Credential exclusion test passes.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Empty tables: must still produce `db/<table>.json` containing `[]` so restore can discover the file.
- Project not found: throw `ProjectNotFoundError` (do not return an empty archive).

## Notes

- Forbid `import ... from '$lib/db/index'` in this file; ESLint boundaries should flag it. Add a `legacy-dexie-boundaries` test entry if needed.
