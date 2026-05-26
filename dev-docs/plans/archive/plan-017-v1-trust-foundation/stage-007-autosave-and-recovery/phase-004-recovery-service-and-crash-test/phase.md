---
title: Recovery Service and Crash Test
slug: phase-004-recovery-service-and-crash-test
phase_number: 4
status: complete
owner: Planner Agent
stage: stage-007-autosave-and-recovery
parts:
  - part-001-pending-draft-persistence
  - part-002-recovery-prompt-and-pull-the-plug
estimated_duration: 1d
---

## Goal

Close the autosave loop with a recovery surface that protects authors
against process crashes. Autosave must mirror the pending draft to
durable client storage on every keystroke, and the editor route must
surface a recovery prompt on mount whenever a pending draft survives
without a corresponding server save.

## Parts

| #   | Part                                                                                                  | Status        | Assigned To | Est. Duration |
| --- | ----------------------------------------------------------------------------------------------------- | ------------- | ----------- | ------------- |
| 001 | [Pending Draft Persistence](part-001-pending-draft-persistence/part.md)                               | `in-progress` | architect   | 0.5d          |
| 002 | [Recovery Prompt and Pull-the-Plug Test](part-002-recovery-prompt-and-pull-the-plug/part.md)          | `not-started` | architect   | 0.5d          |

## Acceptance Criteria

- [ ] `autosave-service` mirrors the pending draft to localStorage on
      every `schedule()` call and clears it on successful save.
- [ ] `recovery-service.ts` exposes `scanPendingDrafts`,
      `consumeDraft`, and `discardDraft` and ignores drafts whose
      stored text equals the current server content.
- [ ] `RecoveryPrompt.svelte` renders when the editor route mounts a
      scene with a pending draft that differs from the server text.
- [ ] `tests/editor/recovery-prompt.test.ts` covers the
      pull-the-plug scenario: pre-seed localStorage, mount the
      service, observe the recovery surface, accept or discard.
- [ ] Stage-007 closes: plan.md and stage.md flip to complete.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.
