---
title: Parse Backup
slug: part-001-parse-backup
part_number: 1
status: complete
owner: backend
assigned_to: backend
phase: phase-003-restore-preview-and-validation
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Read an uploaded `.novellum` ZIP into an in-memory representation: `manifest`, `tableFiles[name] -> { rows: unknown[]; rawBytes: Uint8Array }`, `checksumsJson`, `assets[]`.

## Scope

**In scope:**

- `src/lib/server/restore/parse-backup.ts`.

**Out of scope:**

- Validation logic (sibling part-002).
- DB writes (phase-004).

## Implementation Steps

1. Use `fflate` (or whatever ZIP lib the backup builder used) in decompress mode. Reject archives larger than a configurable limit (default 250MB).
2. Locate `manifest.json`, parse JSON, surface a clean `BackupParseError` on JSON syntax errors.
3. For each `db/*.json`: capture both parsed rows and the raw byte slice (needed for checksum re-verification later).
4. Add `tests/backup/parse-backup.test.ts`: round-trips a builder output; rejects truncated bytes; rejects archives missing `manifest.json`.

## Files

**Create:**

- `src/lib/server/restore/parse-backup.ts`
- `tests/backup/parse-backup.test.ts`

## Acceptance Criteria

- [ ] Successful parse returns a fully-typed object — no `any`.
- [ ] Throws `BackupParseError` (subclass of `Error`) on malformed input; never returns partial state.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Do not use the full archive bytes after parse — release the original buffer once tableFiles are extracted to keep peak memory bounded.
