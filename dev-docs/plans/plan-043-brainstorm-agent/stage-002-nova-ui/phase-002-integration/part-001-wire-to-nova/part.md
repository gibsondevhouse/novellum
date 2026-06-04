---
title: Wire to Nova
slug: part-001-wire-to-nova
part_number: 1
status: draft
owner: Planner Agent
assigned_to: —
phase: phase-002-integration
started_at: ~
completed_at: ~
estimated_duration: 0.75d
---

## Objective

Integrate brainstorm UI and agent into the Nova task resolution system so authors can
execute brainstorm sessions and see results.

## Scope

**In scope:**

- Add brainstorm task to Nova task resolver
- Wire `BrainstormAgent` execution to task handler
- Display session UI and proposals in Nova review surface
- Handle loading, error, and success states
- Test end-to-end flow: Nova button → task trigger → agent execution → result display

**Out of scope:**

- Accept/reject logic (that's stage-003)
- Worldbuilding context hookup (that's stage-003)

## Implementation Steps

1. Review Nova task resolver in `src/modules/nova/`
2. Add `brainstorm` to task type enum
3. Create task handler that:
   - Receives seed idea from UI
   - Calls `BrainstormAgent`
   - Catches errors and displays them
4. Render `BrainstormSession` component in Nova result surface
5. Wire loading state during agent execution
6. Add manual QA: trigger brainstorm from Nova, verify proposals appear
7. Test with different seed ideas and verify output format

## Files

**Update:**

- Nova task resolver (exact path depends on implementation)
- Nova component rendering logic
- Task type definitions

**Create:**

- Brainstorm task handler if needed

## Acceptance Criteria

- [ ] Brainstorm task type added to Nova task resolver
- [ ] Authors can trigger brainstorm from Nova UI
- [ ] Agent executes and returns proposals
- [ ] Proposals display in review surface
- [ ] Error handling works (malformed output, network errors)
- [ ] Loading state shows during execution
- [ ] `pnpm test` passes with any integration tests
- [ ] `pnpm check` passes with zero errors

## Edge Cases

- Network error during agent execution (show error message)
- Malformed agent response (show error message)
- Empty seed idea (should still work or show validation message)
- Very slow agent execution (loading state should be clear)

## Notes

The Nova integration should feel natural and consistent with existing agents (Edit, Rewrite, Style).
Reuse the same loading spinners, error messages, and button patterns.
