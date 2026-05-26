---
title: Autosave Retry Policy
slug: part-002-autosave-retry-policy
part_number: 2
status: complete
owner: backend
assigned_to: backend
phase: phase-001-autosave-result-types-and-retry
started_at: 2026-04-29
completed_at: 2026-04-29
estimated_duration: 0.5d
---

## Objective

Layer a bounded exponential-backoff retry on top of the
`AutosaveResult` shape introduced in part-001. Failed saves must retain
their pending text so the recovery service in phase-004 has something
to recover.

## Files

**Modify:**

- `src/modules/editor/services/autosave-service.ts`

**Create:**

- `tests/editor/autosave-failure.test.ts`

## Retry Policy

- Attempt 1 → fail → wait 500ms.
- Attempt 2 → fail → wait 1500ms.
- Attempt 3 → fail → wait 4500ms.
- Attempt 4 → fail → emit `failed` and stop. Next user keystroke
  resets `attempt` to 0 and re-arms the debounce.

The pending draft is held in memory across retries and is never
overwritten by a fresh keystroke unless that keystroke succeeds in
flushing.

## Acceptance Criteria

- [ ] Failed save emits `failed` with `pendingDraft` still set.
- [ ] Retries respect the bounded delay schedule (test uses
      `vi.useFakeTimers`).
- [ ] Successful retry clears `pendingDraft` and emits `saved` with a
      fresh `savedAt` ISO timestamp.
- [ ] After max attempts, no further automatic retries fire until a
      new keystroke.
- [ ] Errors emitted to the subscriber are sanitised — no stack traces
      or env values.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
