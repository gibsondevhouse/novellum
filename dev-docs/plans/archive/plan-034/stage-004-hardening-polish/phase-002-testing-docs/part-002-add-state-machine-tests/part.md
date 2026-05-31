---
title: Add State Machine Tests
slug: part-002-add-state-machine-tests
part_number: 2
status: draft
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-002-testing-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `tests/world-building/worldbuild-generation-state.test.ts` covering all 8 generation states and all valid/invalid transitions in the per-domain state machine.

## Scope

**In scope:**

- One test block per state covering all valid transitions out of that state
- One test block per illegal transition verifying a descriptive error is thrown
- Test `evaluateReadiness` integration: verify `missing-context` state is set when deps are missing
- Test `resetState`: verify domain returns to `idle`

**Out of scope:**

- UI rendering/component tests
- Integration with API endpoints

## Implementation Steps

1. Create `tests/world-building/worldbuild-generation-state.test.ts`.
2. Import the state machine module (use `vi.mock` to avoid Svelte DOM requirements in Node environment if needed).
3. Write transition tests covering all 8 states and their legal/illegal paths from `LEGAL_TRANSITIONS`.
4. Write `evaluateReadiness` test: `{ personae: 0, atlas: 0 }` → atlas state is `missing-context`.
5. Write `resetState` test.
6. Run `pnpm test tests/world-building/worldbuild-generation-state.test.ts`.
7. Save test output to `evidence/`.

## Files

**Create:**

- `tests/world-building/worldbuild-generation-state.test.ts`

**Update:**

- None

## Acceptance Criteria

- [ ] All 8 states have at least one valid-transition test
- [ ] At least 3 illegal transition tests with descriptive error assertions
- [ ] `evaluateReadiness` and `resetState` tests pass
- [ ] All new tests pass in isolation
- [ ] Full `pnpm test` suite passes
- [ ] Test output in `evidence/`

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
