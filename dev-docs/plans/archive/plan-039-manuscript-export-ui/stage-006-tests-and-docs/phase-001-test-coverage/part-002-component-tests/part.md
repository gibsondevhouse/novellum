---
title: Add component tests
slug: part-002-component-tests
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-006-tests-and-docs
phase: phase-001-test-coverage
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.15d
dependencies: ["part-001-service-unit-tests"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Add component tests

## Objective

Ensure the manuscript export dialog renders, validates, and transitions correctly at component level.

## Problem

The dialog has multiple controls and states. Component tests are needed to catch UI wiring mistakes without relying only on e2e.

## Files

**Create:**

- None.

**Update:**

- `src/modules/export/components/ManuscriptExportDialog.test.ts`
- `src/modules/export/components/ChapterSubsetSelector.test.ts`
- `src/modules/export/components/ExportFormatSelector.test.ts`

## Required Changes

- Assert initial render/defaults.
- Assert profile and format changes update UI state.
- Assert chapter validation blocks invalid export.
- Assert success/failure messages appear from mocked service results.
- Assert accessibility status/alert regions exist.

## UI/UX Requirements

- Tests should query by role/label/text, not implementation classes.

## Data Requirements

- Use minimal chapter fixtures.

## Error Handling Requirements

- Mock generation and delivery failures separately.

## Tests

- Run component test suite.
- Keep mocks narrow and explicit.

## Acceptance Criteria

- [x] Component tests cover open, close, validation, success, failure, and cancel states.
- [x] Tests use accessible queries where possible.
- [x] No brittle CSS selector tests.

## Out of Scope

- Do not test every possible format/profile permutation.

## Dependencies

- part-001-service-unit-tests

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Ensure the manuscript export dialog renders, validates, and transitions correctly at component level.
2. **Problem:** The dialog has multiple controls and states. Component tests are needed to catch UI wiring mistakes without relying only on e2e.
3. **Files:** Create: None. Update: src/modules/export/components/ManuscriptExportDialog.test.ts, src/modules/export/components/ChapterSubsetSelector.test.ts, src/modules/export/components/ExportFormatSelector.test.ts.
4. **Changes:** Assert initial render/defaults., Assert profile and format changes update UI state., Assert chapter validation blocks invalid export., Assert success/failure messages appear from mocked service results., Assert accessibility status/alert regions exist.
5. **UI/UX:** Tests should query by role/label/text, not implementation classes.
6. **Data:** Use minimal chapter fixtures.
7. **Errors:** Mock generation and delivery failures separately.
8. **Tests:** Run component test suite., Keep mocks narrow and explicit.
9. **Criteria:** Component tests cover open, close, validation, success, failure, and cancel states., Tests use accessible queries where possible., No brittle CSS selector tests.
10. **Out-of-scope:** Do not test every possible format/profile permutation.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-service-unit-tests.
