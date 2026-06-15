---
title: Load ordered chapters for export
slug: part-001-load-ordered-chapters
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-004-chapter-subset-selection
phase: phase-001-chapter-picker
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.25d
dependencies: ["part-002-update-export-service-contract"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Load ordered chapters for export

## Objective

Provide the dialog with ordered chapter metadata needed for all/range/selected export scopes.

## Problem

Chapter selection must match manuscript order, not incidental render order. The assembler already filters by selected IDs, but the UI needs accurate ordered chapter choices.

## Files

**Create:**

- `src/modules/export/services/export-chapter-options.ts`
- `src/modules/export/services/export-chapter-options.test.ts`

**Update:**

- `src/modules/export/index.ts`

## Required Changes

- Create a lightweight service/helper that returns ordered chapter options for a project.
- Include chapter ID, title, order, and optional scene/word count if cheaply available.
- Use existing chapter repository ordering rather than re-sorting unless evidence shows sorting is needed.
- Export helper through module index if used outside the module.

## UI/UX Requirements

- No UI in this part.
- Helper output should support labels like `Chapter 3 — Title`.

## Data Requirements

- Read-only repository access.
- No schema changes.

## Error Handling Requirements

- Missing project or repository failure must return a controlled error to the dialog.
- Empty chapter array is a valid state.

## Tests

- Returns chapters in repository order.
- Handles empty chapter list.
- Handles missing titles with fallback labels.

## Acceptance Criteria

- [x] Chapter option helper exists and is typed.
- [x] Helper tests pass.
- [x] No UI code depends on raw repository rows.

## Out of Scope

- Do not alter chapter repository behavior.
- Do not compute expensive scene word counts unless needed by UX spec.

## Dependencies

- part-002-update-export-service-contract

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Provide the dialog with ordered chapter metadata needed for all/range/selected export scopes.
2. **Problem:** Chapter selection must match manuscript order, not incidental render order. The assembler already filters by selected IDs, but the UI needs accurate ordered chapter choices.
3. **Files:** Create: src/modules/export/services/export-chapter-options.ts, src/modules/export/services/export-chapter-options.test.ts. Update: src/modules/export/index.ts.
4. **Changes:** Create a lightweight service/helper that returns ordered chapter options for a project., Include chapter ID, title, order, and optional scene/word count if cheaply available., Use existing chapter repository ordering rather than re-sorting unless evidence shows sorting is needed., Export helper through module index if used outside the module.
5. **UI/UX:** No UI in this part., Helper output should support labels like `Chapter 3 — Title`.
6. **Data:** Read-only repository access., No schema changes.
7. **Errors:** Missing project or repository failure must return a controlled error to the dialog., Empty chapter array is a valid state.
8. **Tests:** Returns chapters in repository order., Handles empty chapter list., Handles missing titles with fallback labels.
9. **Criteria:** Chapter option helper exists and is typed., Helper tests pass., No UI code depends on raw repository rows.
10. **Out-of-scope:** Do not alter chapter repository behavior., Do not compute expensive scene word counts unless needed by UX spec.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-002-update-export-service-contract.
