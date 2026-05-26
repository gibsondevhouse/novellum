---
title: Backup Builder and Checksums
slug: phase-002-backup-builder-and-checksums
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-004-backup-and-restore
parts:
  - part-001-checksums
  - part-002-backup-builder
  - part-003-backup-route
estimated_duration: 1.5d
---

## Goal

Produce a complete, deterministic `.novellum` archive directly from SQLite, served via a server route. Every project-owned table flows through the registry; every file is checksummed; nothing is read from Dexie.

## Parts

| #   | Part                                                | Status  | Assigned To | Est. Duration |
| --- | --------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Checksums](part-001-checksums/part.md)             | `draft` | backend     | 0.25d         |
| 002 | [Backup Builder](part-002-backup-builder/part.md)   | `draft` | backend     | 0.75d         |
| 003 | [Backup Route](part-003-backup-route/part.md)       | `draft` | backend     | 0.5d          |

## Acceptance Criteria

- [ ] `POST /api/backup/projects/[id]` returns a `.novellum` archive with manifest, per-table JSON files (driven by the registry), `assets/` directory, and `checksums.json`.
- [ ] Backup excludes credentials, machine-specific paths, and any registry entry with `include: false`.
- [ ] Round-trip test: every registered table's full row count matches the count reported in the manifest.
- [ ] `tests/backup/project-backup.test.ts`, `tests/backup/credential-exclusion.test.ts` pass.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Builder must be sync-friendly: read tables via `db.prepare(...).all()`, accumulate JSON, then stream the ZIP. `better-sqlite3` is sync.
- All checksums are SHA-256 over the exact byte stream that lands in the archive.
