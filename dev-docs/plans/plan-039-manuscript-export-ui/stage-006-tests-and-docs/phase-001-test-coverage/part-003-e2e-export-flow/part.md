---
title: Add e2e export flow
slug: part-003-e2e-export-flow
part_number: 3
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-006-tests-and-docs
phase: phase-001-test-coverage
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.15d
dependencies: ["part-002-component-tests"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 003 — Add e2e export flow

## Objective

Add one Playwright path that proves a user can open the export dialog, choose a supported format, and trigger a download/export success path.

## Problem

Unit and component tests can still miss route entry-point issues and real user flow regressions.

## Files

**Create:**

- `tests/e2e/manuscript-export.spec.ts`

**Update:**

- None.

## Required Changes

- Seed or navigate to a project with at least one chapter and scene using existing e2e patterns.
- Open `Export manuscript` from the selected entry point.
- Select Markdown or DOCX depending on easiest deterministic test path.
- Trigger export and assert download or success status.
- Keep the test narrow and resilient.

## UI/UX Requirements

- Use role/label locators for user-facing controls.
- Do not rely on pixel/layout assertions.

## Data Requirements

- Use existing fixture factory or minimal setup.
- Do not depend on external services.

## Error Handling Requirements

- Test should fail clearly if route entry point disappears.

## Tests

- Run targeted Playwright spec.
- Run full e2e only if local time permits.

## Acceptance Criteria

- [x] E2e test covers the core happy path.
- [x] Test does not require desktop shell.
- [x] Test is documented in evidence.

## Out of Scope

- Do not add exhaustive e2e matrix.
- Do not test Tauri native save in browser e2e.

## Dependencies

- part-002-component-tests

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Add one Playwright path that proves a user can open the export dialog, choose a supported format, and trigger a download/export success path.
2. **Problem:** Unit and component tests can still miss route entry-point issues and real user flow regressions.
3. **Files:** Create: tests/e2e/manuscript-export.spec.ts. Update: None.
4. **Changes:** Seed or navigate to a project with at least one chapter and scene using existing e2e patterns., Open `Export manuscript` from the selected entry point., Select Markdown or DOCX depending on easiest deterministic test path., Trigger export and assert download or success status., Keep the test narrow and resilient.
5. **UI/UX:** Use role/label locators for user-facing controls., Do not rely on pixel/layout assertions.
6. **Data:** Use existing fixture factory or minimal setup., Do not depend on external services.
7. **Errors:** Test should fail clearly if route entry point disappears.
8. **Tests:** Run targeted Playwright spec., Run full e2e only if local time permits.
9. **Criteria:** E2e test covers the core happy path., Test does not require desktop shell., Test is documented in evidence.
10. **Out-of-scope:** Do not add exhaustive e2e matrix., Do not test Tauri native save in browser e2e.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-002-component-tests.
