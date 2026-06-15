---
title: Wire Proposal Accept Reject Refresh
slug: part-002-wire-proposal-accept-reject-refresh
part_number: 2
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-002-proposal-review-actions
started_at: ~
completed_at: ~
estimated_duration: 1d
---

## Objective

Connect proposal review tile actions to accept/reject routes and refresh/upsert local suggestion state after mutations.

## Scope

**In scope:**

- Call existing worldbuilding proposal accept/reject endpoints.
- Update local suggestion state using upsertSuggestionLocal or refreshSuggestions.
- Display success, conflict, and failure states.
- Add E2E coverage for review actions.

**Out of scope:**

- Changing canon merge algorithm behavior.

## Implementation Steps

1. Inventory current proposal accept/reject API shapes.
2. Add a small client action service.
3. Wire actions into review section/tile callbacks.
4. Cover accept, reject, conflict, and failed network states.

## Files

**Create:**

- `src/modules/world-building/services/worldbuild-proposal-actions.ts`
- `tests/e2e/worldbuilding-proposal-review.spec.ts`

**Update:**

- `src/modules/world-building/components/WorldbuildingProposedTile.svelte`
- `src/modules/world-building/components/WorldbuildingProposalReviewSection.svelte`
- `src/modules/world-building/stores/worldbuild-suggestion-state.svelte.ts`

**Reference:**

- `src/routes/api/worldbuilding/proposals/[proposalId]/accept/+server.ts`
- `src/routes/api/worldbuilding/proposals/[proposalId]/reject/+server.ts`

## Acceptance Criteria

- [ ] Accept removes or relabels the pending proposal after server success.
- [ ] Reject records a visible rejected state or removes from pending count after server success.
- [ ] Failed actions are retryable and do not lose local proposal data.
- [ ] E2E proves persisted proposals surface and can be acted on.

## Edge Cases

- Proposal may be stale because another route accepted it.
- Accept may detect duplicate canon entities and return conflict evidence.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
