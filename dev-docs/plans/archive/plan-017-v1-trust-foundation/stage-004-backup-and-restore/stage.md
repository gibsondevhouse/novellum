---
title: Backup and Restore
slug: stage-004-backup-and-restore
stage_number: 4
status: complete
owner: Planner Agent
plan: plan-017-v1-trust-foundation
phases:
  - phase-001-table-registry-and-manifest
  - phase-002-backup-builder-and-checksums
  - phase-003-restore-preview-and-validation
  - phase-004-restore-execution-transactional
  - phase-005-export-modal-ia-split
estimated_duration: 6d
risk_level: high
---

## Goal

Ship the canonical `.novellum` project backup format: SQLite-backed, manifested, checksummed, transactional on restore, and complete across every project-owned table. Replace all Dexie-backed export/restore code paths.

## Phases

| #   | Phase                                                                                       | Status     | Est. Duration |
| --- | ------------------------------------------------------------------------------------------- | ---------- | ------------- |
| 001 | [Table Registry and Manifest](phase-001-table-registry-and-manifest/phase.md)               | `draft`    | 1d            |
| 002 | [Backup Builder and Checksums](phase-002-backup-builder-and-checksums/phase.md)             | `draft`    | 1.5d          |
| 003 | [Restore Preview and Validation](phase-003-restore-preview-and-validation/phase.md)         | `draft`    | 1d            |
| 004 | [Restore Execution (Transactional)](phase-004-restore-execution-transactional/phase.md)     | `draft`    | 1.5d          |
| 005 | [Export Modal IA Split](phase-005-export-modal-ia-split/phase.md)                           | `draft`    | 1d            |

## Entry Criteria

- Stage 002 complete (SQLite is canonical).
- Stage 003 complete (versioned migrations support `schemaVersion` in manifest).

## Exit Criteria

- `src/lib/server/backup/table-registry.ts` enumerates every project-owned table with explicit include/exclude reasons.
- `.novellum` archive contents match research §6: `manifest.json`, `db/*.json` for each registered table, `assets/`, `checksums.json`.
- `src/lib/server/backup/manifest.ts` produces a manifest with `format`, `formatVersion`, `appVersion` (from canonical `src/lib/version.ts`), `schemaVersion`, `exportedAt`, `project`, `tables`, and `compatibility`.
- New routes exist and are tested:
  - `POST /api/backup/projects/[id]` → returns `.novellum` archive built from SQLite.
  - `POST /api/restore/preview` → returns parsed manifest + table counts + checksum status.
  - `POST /api/restore/project` → restores transactionally, supports restore-as-copy and restore-over-existing.
- Old Dexie portability code (`src/modules/export/services/portability/*`) no longer imports `$lib/db/index`. Snapshot and restore services route through SQLite-backed services.
- Export UI separates **Manuscript Export** (Markdown/DOCX/EPUB — handled by plan-018) from **Project Backup** (`.novellum`). Backup is no longer presented as a manuscript export format.
- Backup excludes credentials and machine-specific paths; tests assert this.
- Test suite passes:
  - `tests/backup/project-backup.test.ts` — populated project round-trips through every registered table.
  - `tests/backup/project-restore.test.ts` — restore reconstructs project on a fresh DB.
  - `tests/backup/corrupt-backup.test.ts` — corrupt archive fails safely without partial writes.
  - `tests/backup/credential-exclusion.test.ts` — backup contains no API key material.

## Notes

- Source: [market-readiness-pt1.md §6](../../research/market-readiness-pt1.md).
- Restore-as-copy must mint a new `project.id` and rewrite every foreign key to point to the new id within a single transaction.
- File extension: `project-title_YYYY-MM-DD.novellum` (zip internals). Refuse archives whose `format !== 'novellum.project.backup'`.
- Coordinate with plan-018 stage-001 to ensure Manuscript Export and Project Backup are visually and conceptually separated in the UI.
