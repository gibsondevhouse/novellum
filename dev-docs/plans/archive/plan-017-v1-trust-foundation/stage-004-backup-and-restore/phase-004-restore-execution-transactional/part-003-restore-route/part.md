---
title: Restore Route
slug: part-003-restore-route
part_number: 3
status: complete
owner: backend
assigned_to: backend
phase: phase-004-restore-execution-transactional
started_at: 2026-04-28
completed_at: 2026-04-28
estimated_duration: 0.5d
---

## Objective

Expose restore behind `POST /api/restore/project` with a clear contract for both modes.

## Scope

**In scope:**

- `src/routes/api/restore/project/+server.ts`.

**Out of scope:**

- UI changes (phase-005).

## Implementation Steps

1. Accept multipart upload + form fields `mode: 'overwrite' | 'copy'`, `targetProjectId?: string`.
2. Parse + validate via phase-003 modules. Refuse if `compatibility.canRestore === false`.
3. Call `restoreProject` and translate result:
   - `ok: true` → 200 with `{ projectId, mode, snapshotPath }`.
   - Validation refusal → 422 with `{ error: 'restore_refused', warnings }`.
   - Internal error → 500 with `{ error: 'restore_failed', snapshotPath }`.
4. Add `tests/routes/api-restore-project.test.ts` covering both modes + a refusal case.

## Files

**Create:**

- `src/routes/api/restore/project/+server.ts`
- `tests/routes/api-restore-project.test.ts`

## Acceptance Criteria

- [ ] Both restore modes return appropriate status codes.
- [ ] Server response always includes the `snapshotPath` so clients can advise the user.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Defer the modal/UI flow to phase-005; this route is the API contract that flow will call.
