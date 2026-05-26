---
title: Autosave Result Types and Retry
slug: phase-001-autosave-result-types-and-retry
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-007-autosave-and-recovery
parts:
  - part-001-autosave-result-types
  - part-002-autosave-retry-policy
estimated_duration: 1d
---

## Goal

Replace the autosave service's loose `'saving' | 'saved' | 'idle'`
string callback with a structured `AutosaveResult` shape and add a
bounded retry policy that retains pending text on failure. This is the
foundation every other phase in stage-007 depends on.

## Parts

| #   | Part                                                                                | Status        | Assigned To | Est. Duration |
| --- | ----------------------------------------------------------------------------------- | ------------- | ----------- | ------------- |
| 001 | [Autosave Result Types](part-001-autosave-result-types/part.md)                     | `in-progress` | backend     | 0.5d          |
| 002 | [Autosave Retry Policy](part-002-autosave-retry-policy/part.md)                     | `not-started` | backend     | 0.5d          |

## Acceptance Criteria

- [ ] `AutosaveStatus` narrowed to `'idle' | 'saving' | 'saved' | 'failed'`.
- [ ] Service emits `AutosaveResult { status, savedAt?, error?, pendingDraft? }`
      to a single subscriber callback (back-compat string callbacks dropped).
- [ ] Failed save preserves `pendingDraft` and retries with exponential
      backoff up to a bounded attempt count, after which the result
      stays `failed` until the next user keystroke.
- [ ] `tests/editor/autosave-failure.test.ts` covers: save throws →
      result is `failed` with `pendingDraft` retained → next successful
      flush clears the pending draft and emits `saved`.
- [ ] `pnpm run check && pnpm run lint && pnpm run test` green.

## Notes

- Source: [market-readiness-pt1.md §10](../../../research/market-readiness-pt1.md).
- Snapshot suppression and metadata land in phase-002.
- UI consumers (`SaveStatus.svelte`) ship in phase-003; this phase only
  produces the data shape they need.
