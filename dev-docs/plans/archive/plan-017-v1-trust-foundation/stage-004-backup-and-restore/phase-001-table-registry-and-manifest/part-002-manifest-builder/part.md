---
title: Manifest Builder
slug: part-002-manifest-builder
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-001-table-registry-and-manifest
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Build and validate the canonical `.novellum` manifest object. This is a pure module: no DB reads, no FS access. It will be consumed by the backup builder (phase-002) and the restore validator (phase-003).

## Scope

**In scope:**

- New `src/lib/server/backup/manifest.ts`.
- Canonical `src/lib/version.ts` if it does not exist (single source of `APP_VERSION`).

**Out of scope:**

- Computing table row counts (caller responsibility — counts are passed in).
- Checksums (sibling phase-002 part).

## Implementation Steps

1. Ensure `src/lib/version.ts` exists and exports `export const APP_VERSION = '1.0.0'`. Replace any hardcoded `'0.1.0'` references in product code on a best-effort drive-by basis.
2. Create `src/lib/server/backup/manifest.ts` exporting:
   - `BACKUP_FORMAT = 'novellum.project.backup'` and `BACKUP_FORMAT_VERSION = 1`.
   - `BackupManifest` type that matches the research §6 shape exactly.
   - `buildManifest(input: { project: { id: string; title: string; type: string }; schemaVersion: number; tableCounts: Record<string, number>; exportedAt?: string }): BackupManifest`.
   - `validateManifest(value: unknown): { ok: true; manifest: BackupManifest } | { ok: false; reason: string }` — checks required fields, `format === BACKUP_FORMAT`, `formatVersion <= BACKUP_FORMAT_VERSION`, and that every key in `tables` is a non-negative integer.
3. Add `tests/backup/manifest.test.ts`:
   - Builds a manifest and asserts every required field is present and well-typed.
   - Round-trips through `JSON.stringify` / `validateManifest`.
   - Rejects manifests with wrong `format`, missing `project.id`, future `formatVersion`, or non-integer table counts.

## Files

**Create:**

- `src/lib/server/backup/manifest.ts`
- `src/lib/version.ts` (only if absent)
- `tests/backup/manifest.test.ts`

## Acceptance Criteria

- [ ] `validateManifest` rejects every malformed shape covered by the test.
- [ ] `appVersion` in the produced manifest equals `APP_VERSION` from `src/lib/version.ts`.
- [ ] `schemaVersion` is supplied by the caller (will be wired to the migration registry max in phase-002).
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Edge Cases

- Manifest produced now must remain readable by future Novellum builds → `formatVersion` is the compatibility lever, never the file-extension or table list.
- Older builds reading a future manifest → `validateManifest` returns a structured `{ ok: false, reason }`, never throws.

## Notes

- Keep this module dependency-free apart from `src/lib/version.ts`; in particular, do **not** import the migration registry or DB client here (callers pass `schemaVersion` in).
