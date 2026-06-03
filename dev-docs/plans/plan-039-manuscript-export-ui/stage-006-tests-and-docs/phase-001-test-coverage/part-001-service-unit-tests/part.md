---
title: Add service unit tests
slug: part-001-service-unit-tests
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-006-tests-and-docs
phase: phase-001-test-coverage
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.15d
dependencies: ["part-001-wire-progress-success-error-states"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Add service unit tests

## Objective

Finalize service-level tests for request construction, export dispatch, filename behavior, and delivery fallback.

## Problem

The UI depends on service contracts that can regress silently if not pinned by tests.

## Files

**Create:**

- None.

**Update:**

- `src/modules/export/services/export-service.test.ts`
- `src/modules/export/services/export-delivery.test.ts`
- `src/modules/export/components/chapter-selection.test.ts`

## Required Changes

- Add missing unit tests discovered during implementation.
- Cover request-to-assembler compile options.
- Cover deterministic filename sanitization.
- Cover delivery fallback results.
- Cover chapter selection helpers.

## UI/UX Requirements

- No UI changes unless needed to expose testable behavior.

## Data Requirements

- Use mocks/fixtures; do not depend on real user data.

## Error Handling Requirements

- Test normalized errors and cancel behavior.

## Tests

- Run targeted unit tests.
- Run full test suite if practical.

## Acceptance Criteria

- [x] Service unit tests cover critical paths.
- [x] Tests are deterministic and local.
- [x] No skipped tests added.

## Out of Scope

- Do not chase 100% coverage.
- Do not snapshot large blobs.

## Dependencies

- part-001-wire-progress-success-error-states

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Finalize service-level tests for request construction, export dispatch, filename behavior, and delivery fallback.
2. **Problem:** The UI depends on service contracts that can regress silently if not pinned by tests.
3. **Files:** Create: None. Update: src/modules/export/services/export-service.test.ts, src/modules/export/services/export-delivery.test.ts, src/modules/export/components/chapter-selection.test.ts.
4. **Changes:** Add missing unit tests discovered during implementation., Cover request-to-assembler compile options., Cover deterministic filename sanitization., Cover delivery fallback results., Cover chapter selection helpers.
5. **UI/UX:** No UI changes unless needed to expose testable behavior.
6. **Data:** Use mocks/fixtures; do not depend on real user data.
7. **Errors:** Test normalized errors and cancel behavior.
8. **Tests:** Run targeted unit tests., Run full test suite if practical.
9. **Criteria:** Service unit tests cover critical paths., Tests are deterministic and local., No skipped tests added.
10. **Out-of-scope:** Do not chase 100% coverage., Do not snapshot large blobs.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-wire-progress-success-error-states.
