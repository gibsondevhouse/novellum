---
title: Add Nova Artifact Action Regression Tests
slug: part-001-add-nova-artifact-action-regression-tests
part_number: 1
status: draft
owner: Planner Agent
assigned_to: Codex
phase: phase-001-regression-coverage
started_at: ~
completed_at: ~
estimated_duration: 0.5d
---

## Objective

Cover the corrected artifact action flows at unit/component and E2E levels.

## Scope

**In scope:**

- Unit tests for action services.
- Component tests for card state transitions.
- Targeted Playwright coverage for a representative Nova action path when feasible.

**Out of scope:**

- Full visual regression baseline reset.

## Implementation Steps

1. Add source-contract tests for action services.
2. Add component tests for card handler wiring.
3. Add or update targeted E2E for user-visible action effects.
4. Record command output in evidence.

## Files

**Create:**

- `tests/e2e/nova-artifact-actions.spec.ts`

**Update:**

- `tests/nova`

**Reference:**

- `tests/e2e/project-lifecycle.spec.ts`
- `tests/nova`

## Acceptance Criteria

- [ ] Tests prove Accept/Reject handlers are passed into chat cards.
- [ ] Tests prove revision acknowledgements persist across reload/re-render.
- [ ] E2E or browser evidence proves user-visible states are coherent.

## Edge Cases

- Mock AI behavior should not be the only source of test fixtures.
- Preview E2E may need rebuilt output before validation.

## Verification

- Run the smallest relevant unit or component tests first.
- Run `pnpm check`, `pnpm lint`, and `pnpm lint:css` when Svelte/UI files are touched.
- Run targeted Playwright coverage when the part changes a browser-visible flow.
- Record command output or screenshots in `evidence/` before moving to `review`.

## Notes

This part is draft-only until explicitly activated. Keep review and mutation boundaries real.
