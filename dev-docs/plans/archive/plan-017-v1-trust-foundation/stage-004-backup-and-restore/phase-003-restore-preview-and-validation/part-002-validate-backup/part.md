---
title: Validate Backup
slug: part-002-validate-backup
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-003-restore-preview-and-validation
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Given a parsed backup, produce a `RestorePreview` describing manifest sanity, schema compatibility, checksum status, and any warnings the UI should surface before the user commits.

## Scope

**In scope:**

- `src/lib/server/restore/validate-backup.ts` exposing `validateBackup(parsed): RestorePreview`.

**Out of scope:**

- Performing the restore itself.

## Implementation Steps

1. Run `validateManifest` from phase-001.
2. Cross-check `parsed.tableFiles` keys against `getProjectBackupTables()`:
   - Required-but-missing → warning `missing_required_table`.
   - Present-but-not-in-registry → warning `unknown_table` (forward-compat: do not refuse).
3. Verify checksums by re-hashing `rawBytes` for each `db/*.json` against `checksums.json`. Mismatches → warning `checksum_mismatch` per file.
4. Compare `manifest.schemaVersion` against the bundled max migration version:
   - Equal → ok.
   - Bundled higher → ok (forward-migration will run after restore).
   - Bundled lower → warning `app_too_old` and `compatibility.canRestore: false`.
5. Build `tableCounts` from the parsed table files (not from manifest) — discrepancies between parsed and manifest counts surface as warnings.
6. Add `tests/backup/corrupt-backup.test.ts`: each failure mode produces the right warning code; valid archive yields zero warnings.

## Files

**Create:**

- `src/lib/server/restore/validate-backup.ts`
- `tests/backup/corrupt-backup.test.ts`

## Acceptance Criteria

- [ ] `validateBackup` is total — never throws on malformed-but-parseable archives; returns warnings instead.
- [ ] All warning codes are exhaustive enums in TypeScript.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Warnings are strictly informational. The restore phase decides whether to refuse based on `compatibility.canRestore`.
