---
title: Preview Route
slug: part-003-preview-route
part_number: 3
status: complete
owner: backend
assigned_to: backend
phase: phase-003-restore-preview-and-validation
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.25d
---

## Objective

Wire the parser + validator behind `POST /api/restore/preview`, accepting a multipart upload and returning the preview JSON.

## Scope

**In scope:**

- `src/routes/api/restore/preview/+server.ts`.

**Out of scope:**

- DB writes; this route is read-only relative to the live DB.

## Implementation Steps

1. Accept `multipart/form-data` with a single `file` field. Reject non-ZIP content types.
2. Stream/buffer the upload (configurable size cap, default 250MB), call `parseBackup` then `validateBackup`.
3. Map errors:
   - `BackupParseError` → 400 with `{ error: 'parse_failed', reason }`.
   - Anything else → 500 with `{ error: 'preview_failed' }`.
4. Add `tests/routes/api-restore-preview.test.ts`: happy path and at least one failure path (truncated archive).

## Files

**Create:**

- `src/routes/api/restore/preview/+server.ts`
- `tests/routes/api-restore-preview.test.ts`

## Acceptance Criteria

- [ ] Endpoint never mutates the database.
- [ ] 400 on parse error, 200 with warnings on validation issues, 500 only on truly unexpected errors.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Keep the route handler small; all logic stays in the parse + validate modules so they can be reused by phase-004.
