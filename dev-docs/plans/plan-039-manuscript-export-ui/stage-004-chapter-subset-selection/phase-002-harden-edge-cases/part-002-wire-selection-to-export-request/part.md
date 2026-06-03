---
title: Wire chapter selection to export request
slug: part-002-wire-selection-to-export-request
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-004-chapter-subset-selection
phase: phase-002-harden-edge-cases
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.15d
dependencies: ["part-001-harden-chapter-selection-edge-cases"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Wire chapter selection to export request

## Objective

Connect resolved chapter scope to the export service request and verify the assembler receives selected chapter IDs.

## Problem

The assembler already supports `selectedChapterIds`, but the UI and export service must pass that field correctly.

## Files

**Create:**

- None.

**Update:**

- `src/modules/export/components/ManuscriptExportDialog.svelte`
- `src/modules/export/services/export-service.test.ts`

## Required Changes

- Build export request with resolved `selectedChapterIds` from chapter selection state.
- Omit selected IDs for all-chapter exports.
- Pass selected IDs through service to assembler.
- Verify request construction in tests.

## UI/UX Requirements

- Show selected chapter count in primary action area or summary panel.

## Data Requirements

- `selectedChapterIds` must be an array of IDs only.
- All-chapter export must not pass an empty array.

## Error Handling Requirements

- Block export if request construction yields no chapters for selected/range mode.

## Tests

- Dialog request construction includes selected IDs.
- All-chapter export omits selected IDs.
- Service test verifies assembler receives selected IDs.

## Acceptance Criteria

- [x] Chapter subset reaches `assembleManuscript()`.
- [x] All-chapter behavior remains unchanged.
- [x] Tests prove both selected and all modes.

## Out of Scope

- Do not add scene or beat filters.

## Dependencies

- part-001-harden-chapter-selection-edge-cases

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Connect resolved chapter scope to the export service request and verify the assembler receives selected chapter IDs.
2. **Problem:** The assembler already supports `selectedChapterIds`, but the UI and export service must pass that field correctly.
3. **Files:** Create: None. Update: src/modules/export/components/ManuscriptExportDialog.svelte, src/modules/export/services/export-service.test.ts.
4. **Changes:** Build export request with resolved `selectedChapterIds` from chapter selection state., Omit selected IDs for all-chapter exports., Pass selected IDs through service to assembler., Verify request construction in tests.
5. **UI/UX:** Show selected chapter count in primary action area or summary panel.
6. **Data:** `selectedChapterIds` must be an array of IDs only., All-chapter export must not pass an empty array.
7. **Errors:** Block export if request construction yields no chapters for selected/range mode.
8. **Tests:** Dialog request construction includes selected IDs., All-chapter export omits selected IDs., Service test verifies assembler receives selected IDs.
9. **Criteria:** Chapter subset reaches `assembleManuscript()`., All-chapter behavior remains unchanged., Tests prove both selected and all modes.
10. **Out-of-scope:** Do not add scene or beat filters.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-harden-chapter-selection-edge-cases.
