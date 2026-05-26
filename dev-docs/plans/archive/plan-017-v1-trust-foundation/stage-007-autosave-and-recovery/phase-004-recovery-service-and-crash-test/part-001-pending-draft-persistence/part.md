---
title: Pending Draft Persistence
slug: part-001-pending-draft-persistence
part_number: 1
status: complete
owner: architect
assigned_to: architect
phase: phase-004-recovery-service-and-crash-test
started_at: 2026-04-29
completed_at: 2026-04-29
estimated_duration: 0.5d
---

## Objective

Mirror the autosave pending draft to durable client storage so a
mid-keystroke crash does not lose user work, and add the
`recovery-service` that exposes the pending drafts to the rest of
the editor module.

## Files

**Create:**

- `src/modules/editor/services/recovery-service.ts`
- `tests/editor/recovery-service.test.ts`

**Modify:**

- `src/modules/editor/services/autosave-service.ts`
- `src/modules/editor/index.ts`

## Acceptance Criteria

- [ ] Autosave mirrors `pending` to localStorage on every
      `schedule(text)` call under a deterministic key.
- [ ] Successful save clears the localStorage entry.
- [ ] `recovery-service.scanPendingDrafts()` returns drafts not
      matching the server text and skips matches.
- [ ] `recovery-service.consumeDraft(sceneId)` returns the draft and
      removes the entry.
- [ ] `recovery-service.discardDraft(sceneId)` removes the entry.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
