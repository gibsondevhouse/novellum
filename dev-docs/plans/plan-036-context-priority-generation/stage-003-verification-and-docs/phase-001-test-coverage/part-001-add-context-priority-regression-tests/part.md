---
title: Add Context-Priority Regression Tests
slug: part-001-add-context-priority-regression-tests
part_number: 1
status: review
owner: Planner Agent
assigned_to: Reviewer Agent
phase: phase-001-test-coverage
started_at: 2026-05-30
completed_at: 2026-05-30
estimated_duration: 0.75d
---

## Objective

Create a regression suite that protects the new context-priority generation contract and expanded character-field behavior.

## Scope

**In scope:**

- Route-level tests for context payload parsing and character schema expectations.
- Unit tests for extractor and validator utilities.
- Store/service tests ensuring typed context reaches fetch body.

**Out of scope:**

- Full browser e2e coverage (optional follow-up).

## Implementation Steps

1. Extend route test coverage in `tests/routes/worldbuilding-generate-route.test.ts`.
2. Add utility tests for extraction and validation modules.
3. Add store/service contract tests with fetch mocking.
4. Run targeted tests plus full `pnpm test` baseline.

## Files

**Create:**

- `tests/world-building/generation-context-extractor.test.ts`
- `tests/world-building/worldbuilding-draft-validator.test.ts`

**Update:**

- `tests/routes/worldbuilding-generate-route.test.ts`
- `tests/world-building/worldbuild-generation.test.ts`

## Acceptance Criteria

- [x] New tests cover happy-path and malformed payload cases
- [x] Existing generation tests remain green
- [x] Full test suite passes with no new flaky failures

## Edge Cases

- Verify behavior when extracted names include punctuation, apostrophes, or mixed casing.

## Notes

Prioritize clear fixture data so failures immediately identify whether the break is extraction, validation, or routing.
