---
title: Restore Preview and Validation
slug: phase-003-restore-preview-and-validation
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-004-backup-and-restore
parts:
  - part-001-parse-backup
  - part-002-validate-backup
  - part-003-preview-route
estimated_duration: 1d
---

## Goal

Accept an uploaded `.novellum`, parse it without touching the live DB, validate manifest + checksums + required tables, and return a structured preview that the UI can show before any destructive action.

## Parts

| #   | Part                                              | Status  | Assigned To | Est. Duration |
| --- | ------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [Parse Backup](part-001-parse-backup/part.md)     | `draft` | backend     | 0.25d         |
| 002 | [Validate Backup](part-002-validate-backup/part.md) | `draft` | backend     | 0.5d          |
| 003 | [Preview Route](part-003-preview-route/part.md)   | `draft` | backend     | 0.25d         |

## Acceptance Criteria

- [ ] `POST /api/restore/preview` accepts a multipart upload and returns `{ manifest, tableCounts, checksumStatus, compatibility, warnings }`.
- [ ] Refuses archives whose `format !== 'novellum.project.backup'`.
- [ ] Surfaces missing required tables and checksum mismatches as structured warnings (not 500s).
- [ ] `tests/backup/corrupt-backup.test.ts` passes.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- This phase performs **zero** writes. Preview is purely informational.
