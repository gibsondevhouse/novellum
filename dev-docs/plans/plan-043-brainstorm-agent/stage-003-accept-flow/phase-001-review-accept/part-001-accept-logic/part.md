---
title: Accept Logic
slug: part-001-accept-logic
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-001-review-accept
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Implement accept/reject buttons in the brainstorm UI and create a staging service that holds
accepted seeds for use in worldbuilding.

## Scope

**In scope:**

- Add accept/reject buttons to `ProposalCard.svelte`
- Create `brainstorm-staging.store.ts` (Svelte store for accepted seeds)
- Wire buttons to staging store
- Show accept/reject state in UI
- Add clear/remove functionality

**Out of scope:**

- Persistence to database (use ephemeral store)
- Worldbuilding integration (that's phase-002)

## Implementation Steps

1. Create `src/lib/stores/brainstorm-staging.store.ts`
   - Define `BrainstormStaging` store with accepted seeds list
   - Implement `addSeed()`, `removeSeed()`, `clear()` methods
2. Update `ProposalCard.svelte` to include accept/reject buttons
3. Wire buttons to staging store methods
4. Show visual state (accepted seeds highlighted or moved to accepted list)
5. Add "Clear all" button to brainstorm session
6. Test accept/reject flow with manual interaction
7. Verify seeds persist in store until cleared

## Files

**Create:**

- `src/lib/stores/brainstorm-staging.store.ts`

**Update:**

- `src/modules/nova/components/brainstorm/ProposalCard.svelte` — add buttons
- `src/modules/nova/components/brainstorm/BrainstormSession.svelte` — add clear button

## Acceptance Criteria

- [ ] Staging store created with add/remove/clear methods
- [ ] Accept/reject buttons render on each proposal
- [ ] Clicking accept adds seed to staging store
- [ ] Clicking reject removes seed from view (or keeps in list but marks rejected)
- [ ] Clear button empties staging store
- [ ] UI state reflects accepted/rejected status
- [ ] `pnpm check` passes with zero errors

## Edge Cases

- Accepting multiple seeds of same category
- Rejecting a seed then accepting it again
- Clearing all seeds
- Store state persists during session

## Notes

Keep the staging store simple for now. It's ephemeral within the session. If persistence
is needed later, this can be refactored to persist to a database table.
