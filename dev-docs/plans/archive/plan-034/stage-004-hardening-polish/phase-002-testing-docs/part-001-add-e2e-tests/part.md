---
title: Add E2e Tests
slug: part-001-add-e2e-tests
part_number: 1
status: draft
owner: Reviewer Agent
assigned_to: Reviewer Agent
phase: phase-002-testing-docs
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Create `tests/world-building/worldbuild-generation.test.ts` with end-to-end Vitest tests covering the full domain generation flow: generate for each domain, missing-context gating, accept/reject, and error recovery.

## Scope

**In scope:**

- Happy path: generate proposal for each of the five domains, verify proposal enters `review-ready` state
- Missing-context gate: verify Atlas generate is blocked when Personae count is 0
- Accept: verify accepted proposal triggers canon table insert and `projectedToCanon: true`
- Reject: verify rejected proposal updates lifecycle without canon write
- Error recovery: simulate model failure, verify `failed` state and Retry button

**Out of scope:**

- Visual regression tests (Playwright visual suite)
- Isolated state machine unit tests (part-002)

## Implementation Steps

1. Create `tests/world-building/` directory and `worldbuild-generation.test.ts`.
2. Use Vitest with mocked `openrouter.ts` (to avoid real API calls in CI).
3. Write tests for each scenario listed in scope.
4. Run `pnpm test tests/world-building/worldbuild-generation.test.ts` to confirm isolation.
5. Run `pnpm test` to confirm full suite still passes.
6. Save test output to `evidence/`.

## Files

**Create:**

- `tests/world-building/worldbuild-generation.test.ts`

**Update:**

- None

## Acceptance Criteria

- [ ] Tests cover all five scenarios in scope
- [ ] OpenRouter is mocked (no real API calls in CI)
- [ ] All new tests pass
- [ ] Full `pnpm test` suite passes
- [ ] At least one artifact is added to evidence/

## Edge Cases

- Preserve review-gated behavior: generation proposals must remain non-canonical until explicit user acceptance.

## Notes

Keep impl.log.md append-only. Move status to review only after post-implementation checklist is complete.
