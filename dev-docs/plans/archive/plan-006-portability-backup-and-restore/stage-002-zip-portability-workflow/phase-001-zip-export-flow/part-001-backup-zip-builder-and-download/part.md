---
title: Backup ZIP Builder and Download
slug: part-001-backup-zip-builder-and-download
part_number: 1
status: draft
owner: backend
assigned_to: backend
phase: phase-001-zip-export-flow
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

> Convert portability snapshots into a versioned archive and trigger browser download with a predictable file naming convention.

## Scope

**In scope:**

- ZIP archive assembly from manifest + snapshot payloads
- Add archive checksums and manifest embedding
- Provide downloadable Blob and filename metadata
- Add export service entry point for backup ZIP format

**Out of scope:**

- Export modal UI controls
- Import/restore logic

## Implementation Steps

1. Add ZIP dependency via `pnpm add jszip`

2. Create `src/modules/export/services/portability/zip-export.ts`:
   - `buildBackupArchive(projectId)`
   - `createBackupFilename(projectTitle, exportedAt)`

3. Archive structure:
   - `manifest.json`
   - `db/<table>.json` for each Dexie table
   - `kv/localStorage.json` for key-value snapshot

4. Compute and embed checksums per payload path in manifest

5. Update `src/modules/export/types.ts`:
   - add `backup_zip` to `ExportFormat`

6. Update `src/modules/export/services/export-service.ts`:
   - branch for `backup_zip`
   - return `{ filename, blob }` like existing export formats

7. Add tests in `src/modules/export/services/__tests__/zip-export.test.ts`:
   - archive contains required entries
   - manifest checksum map aligns with payload files

## Files

**Create:**

- `src/modules/export/services/portability/zip-export.ts`
- `src/modules/export/services/__tests__/zip-export.test.ts`

**Update:**

- `package.json` — add `jszip`
- `src/modules/export/types.ts` — add backup format
- `src/modules/export/services/export-service.ts` — backup branch
- `src/modules/export/index.ts` — export archive builder

## Acceptance Criteria

- [ ] Backup ZIP builds entirely client-side
- [ ] ZIP contains manifest + db payloads + kv payload
- [ ] Export service returns valid filename and Blob
- [ ] Backup branch does not regress existing markdown/docx/epub exports
- [ ] `pnpm run check` exits clean

## Edge Cases

- Project title has unsupported filesystem characters
- Empty project data (still valid archive)
- Very large payloads causing slower compression

## Notes

> Keep export builder independent from Svelte components. UI should only call service APIs.
