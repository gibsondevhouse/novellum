---
title: Automated Quality Gates
slug: part-001-quality-gates
part_number: 1
status: complete
owner: reviewer
assigned_to: reviewer
phase: phase-002-final-qa
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 0.25d
---

## Objective

Execute the full automated quality gate pipeline and fix any remaining issues until all gates pass clean.

## Scope

**In scope:**

- Running and fixing failures in: `lint`, `typecheck`, `test`, `build`
- Achieving ≥ 80% line coverage on all service-layer files (`src/lib/ai/*.ts`, `src/modules/*/services/*.ts`)
- Achieving 0 boundary violations from `eslint-plugin-boundaries`

**Out of scope:**

- Adding new features to raise coverage (only missing tests on existing logic)
- E2E browser tests (separate tooling not yet configured)

## Implementation Steps

1. Run `pnpm run lint`. Fix all reported errors. Re-run until exit 0.
2. Run `pnpm run check`. Fix all type errors. Re-run until exit 0.
3. Run `pnpm run test:coverage`. Review coverage report. For any service file below 80% line coverage, identify the untested paths and write the missing Vitest unit tests.
4. Run `pnpm run build`. Fix any build warnings (unused exports, missing chunks, etc.). Re-run until exit 0 with no warnings.
5. Confirm `eslint-plugin-boundaries` output is clean (no cross-module import violations).

## Files

**Update:**

- Any source files with remaining lint/type errors
- Test files for service-layer coverage gaps

## Acceptance Criteria

- [ ] `pnpm run lint` exits 0.
- [ ] `pnpm run check` exits 0.
- [ ] `pnpm run test` exits 0.
- [ ] `pnpm run test:coverage` shows ≥ 80% line coverage for all files in `src/lib/ai/` and `src/modules/*/services/`.
- [ ] `pnpm run build` exits 0.
- [ ] Zero `eslint-plugin-boundaries` violations.

## Edge Cases

- If a coverage gap is in a file where the missing path is an error-handling branch only reachable via network failure (e.g., fetch throwing), write a test that mocks `fetch` to throw and verify the catch path.

## Notes

Do not artificially inflate coverage by testing implementation details. Only test observable behaviour.
