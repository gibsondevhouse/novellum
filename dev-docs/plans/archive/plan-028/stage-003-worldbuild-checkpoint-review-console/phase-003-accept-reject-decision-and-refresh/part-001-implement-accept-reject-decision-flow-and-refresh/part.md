---
title: Implement Accept/Reject Decision Flow and Refresh
slug: part-001-implement-accept-reject-decision-flow-and-refresh
part_number: 1
status: complete
owner: AI Agent
assigned_to: AI Agent
phase: phase-003-accept-reject-decision-and-refresh
started_at: 2026-05-26T19:25:00Z
completed_at: 2026-05-26T19:30:00Z
estimated_duration: 3d
---

## Objective

Add explicit accept/reject decision actions to the review console and refresh dependent UI/canon-facing state according to checkpoint lifecycle semantics.

## Scope

**In scope:**

- Accept confirmation UX with stage/path/canon-target disclosures.
- Reject workflow requiring reason and storing reviewer feedback.
- Post-decision refresh of queue/history/scope indicators and blocking state.

**Out of scope:**

- New checkpoint lifecycle statuses.
- `vibe-author` decision UI parity.

## Implementation Steps

1. Add accept/reject controls and required form validation.
2. Wire operations to existing checkpoint transition endpoints.
3. Refresh dependent state and expose transition failures predictably.

## Files

**Create:**

- `tests/outline/worldbuild-checkpoint-decision-flow.test.ts`
- `tests/e2e/hierarchical-pipeline-worldbuild-review-flow.spec.ts`

**Update:**

- `src/routes/projects/[id]/outline/+page.svelte`
- `src/modules/world-building/stores/world-building-store.svelte.ts`
- `src/modules/outline/components/OutlineDetailCard.svelte`

## Acceptance Criteria

- [x] Accept action triggers explicit checkpoint `accept` transition only.
- [x] Reject action requires non-empty reason and triggers explicit `reject` transition.
- [x] Queue/history and scope indicators refresh after each decision.
- [x] Canon data remains unchanged until accept transition succeeds.

## Edge Cases

- Transition conflicts (`invalid_transition`) must be surfaced with recoverable guidance.
- Retry after transient failure must not duplicate decision calls.

## Notes

Canon projections for populated-world-bible are handled by existing checkpoint service; UI only initiates explicit transitions.
