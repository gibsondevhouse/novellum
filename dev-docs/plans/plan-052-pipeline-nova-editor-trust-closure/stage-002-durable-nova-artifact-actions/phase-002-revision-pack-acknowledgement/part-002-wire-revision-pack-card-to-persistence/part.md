---
title: Wire Revision Pack Card To Persistence
slug: part-002-wire-revision-pack-card-to-persistence
part_number: 2
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-002-revision-pack-acknowledgement
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Load and update persisted acknowledgement state from the rendered Nova revision pack card.

## Scope

**In scope:**

- Pass acknowledgement callbacks and initial state from NovaMessageLog.
- Render loading/error states without hiding issue content.
- Add component coverage for persisted acknowledged issues.

**Out of scope:**

- Changing revision generation prompts or schemas.

## Implementation Steps

1. Add optional acknowledgedIssueIds and status props to NovaRevisionPackCard.
2. Load acknowledgement state when a revision-pack artifact renders.
3. Persist changes on Acknowledge and update local UI only after success.

## Files

**Create:**

- `tests/nova/nova-revision-pack-card-actions.test.ts`

**Update:**

- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/NovaRevisionPackCard.svelte`

**Reference:**

- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/types.ts`

## Acceptance Criteria

- [ ] Closing and reopening Nova preserves acknowledged issue state.
- [ ] Acknowledgement failure is visible and retryable.
- [ ] The card copy communicates acknowledgement, not acceptance of an edit.

## Edge Cases

- Network failure after click must not permanently disable the button.
- Multiple issues can be acknowledged independently.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
