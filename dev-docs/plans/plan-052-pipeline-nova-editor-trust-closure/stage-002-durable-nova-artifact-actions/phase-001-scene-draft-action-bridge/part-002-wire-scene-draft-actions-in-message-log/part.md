---
title: Wire Scene Draft Actions In Message Log
slug: part-002-wire-scene-draft-actions-in-message-log
part_number: 2
status: review
owner: Planner Agent
assigned_to: Codex
phase: phase-001-scene-draft-action-bridge
started_at: 2026-06-15
completed_at: 2026-06-15
estimated_duration: 0.5d
---

## Objective

Pass real scene draft action handlers from NovaMessageLog into NovaSceneDraftCard and render honest busy/success/error states.

## Scope

**In scope:**

- Add action callbacks and local display state in the message log/card boundary.
- Ensure Copy remains local-only and clearly labelled.
- Add component tests for Accept, Reject, and blocked states.

**Out of scope:**

- Changing unrelated Nova chat rendering.

## Implementation Steps

1. Thread projectId and action handlers into NovaSceneDraftCard.
2. Replace optimistic local-only state with action-result state.
3. Cover disabled, busy, accepted, rejected, and blocked variants.

## Files

**Create:**

- `tests/nova/nova-scene-draft-card-actions.test.ts`

**Update:**

- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/NovaSceneDraftCard.svelte`

**Reference:**

- `src/modules/nova/types.ts`
- `src/modules/nova/stores/nova-session.svelte.ts`

## Acceptance Criteria

- [x] NovaSceneDraftCard receives non-empty handlers in chat view.
- [x] UI text never claims acceptance before the action service returns success.
- [x] Tests fail if handlers are omitted from the message log again.

## Edge Cases

- Message log is intentionally stateless today; introduced handlers should stay narrow and testable.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is in `review` pending real Reviewer Agent sign-off. Keep review and mutation boundaries real.
