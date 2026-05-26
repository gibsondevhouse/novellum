---
title: Backup Route
slug: part-003-backup-route
part_number: 3
status: complete
owner: backend
assigned_to: backend
phase: phase-002-backup-builder-and-checksums
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Expose the backup builder behind a SvelteKit server endpoint and stream the bytes to the client with the correct headers.

## Scope

**In scope:**

- `src/routes/api/backup/projects/[id]/+server.ts` (`POST` handler).

**Out of scope:**

- UI changes (phase-005).

## Implementation Steps

1. Implement `POST` that calls `buildProjectBackup(db, params.id)`, then returns a `Response(archive, { headers: ... })` with:
   - `Content-Type: application/octet-stream` (or `application/x-zip-compressed`).
   - `Content-Disposition: attachment; filename="<filename>"`.
   - `X-Novellum-Backup-Format: novellum.project.backup`.
2. Translate `ProjectNotFoundError` → 404; any other thrown error → 500 with a structured JSON body `{ error: 'backup_failed', reason }`.
3. Add `tests/routes/api-backup.test.ts` (SvelteKit route handler unit test): seeds a project, calls the handler, parses the response body as ZIP, validates the manifest.

## Files

**Create:**

- `src/routes/api/backup/projects/[id]/+server.ts`
- `tests/routes/api-backup.test.ts`

## Acceptance Criteria

- [ ] `POST /api/backup/projects/<id>` returns a `.novellum` ZIP for an existing project.
- [ ] Returns 404 for missing project, 500 with structured body on builder error.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Keep the handler thin: no business logic, just status mapping + response shaping.
