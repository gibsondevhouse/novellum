---
title: Harden chapter selection edge cases
slug: part-001-harden-chapter-selection-edge-cases
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-004-chapter-subset-selection
phase: phase-002-harden-edge-cases
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.2d
dependencies: ["part-002-implement-chapter-selection-ui"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Harden chapter selection edge cases

## Objective

Make chapter selection robust when manuscripts are empty, edited during export, or contain unnamed chapters.

## Problem

Subset selection can become stale if chapters change while the dialog is open. The UI must not generate surprising exports or crash on empty data.

## Files

**Create:**

- None.

**Update:**

- `src/modules/export/components/ChapterSubsetSelector.svelte`
- `src/modules/export/components/chapter-selection.ts`
- `src/modules/export/components/ManuscriptExportDialog.svelte`

## Required Changes

- Add empty manuscript state.
- Add missing title fallback labels.
- Revalidate selected IDs immediately before export.
- Drop stale selected IDs that no longer exist and warn user if necessary.
- Prevent duplicate selected IDs.

## UI/UX Requirements

- Empty state should explain that chapters must be added before manuscript export.
- Stale selection warning should be concise and actionable.
- Do not show scary errors for normal empty project setup.

## Data Requirements

- No persistence.
- All stale-selection handling local to dialog state.

## Error Handling Requirements

- Convert stale IDs to validation warnings before generation.
- Do not call `exportProject()` if selected IDs resolve to zero chapters.

## Tests

- Missing titles produce fallback labels.
- Stale IDs are removed or rejected predictably.
- Duplicate IDs collapse to one ordered ID.
- Empty manuscript blocks export.

## Acceptance Criteria

- [x] Chapter selection cannot produce duplicate IDs.
- [x] Empty manuscript is handled before service call.
- [x] Stale selections do not crash the dialog.
- [x] Tests cover hardening cases.

## Out of Scope

- Do not introduce live collaborative conflict handling.
- Do not change project/chapter editor behavior.

## Dependencies

- part-002-implement-chapter-selection-ui

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Make chapter selection robust when manuscripts are empty, edited during export, or contain unnamed chapters.
2. **Problem:** Subset selection can become stale if chapters change while the dialog is open. The UI must not generate surprising exports or crash on empty data.
3. **Files:** Create: None. Update: src/modules/export/components/ChapterSubsetSelector.svelte, src/modules/export/components/chapter-selection.ts, src/modules/export/components/ManuscriptExportDialog.svelte.
4. **Changes:** Add empty manuscript state., Add missing title fallback labels., Revalidate selected IDs immediately before export., Drop stale selected IDs that no longer exist and warn user if necessary., Prevent duplicate selected IDs.
5. **UI/UX:** Empty state should explain that chapters must be added before manuscript export., Stale selection warning should be concise and actionable., Do not show scary errors for normal empty project setup.
6. **Data:** No persistence., All stale-selection handling local to dialog state.
7. **Errors:** Convert stale IDs to validation warnings before generation., Do not call `exportProject()` if selected IDs resolve to zero chapters.
8. **Tests:** Missing titles produce fallback labels., Stale IDs are removed or rejected predictably., Duplicate IDs collapse to one ordered ID., Empty manuscript blocks export.
9. **Criteria:** Chapter selection cannot produce duplicate IDs., Empty manuscript is handled before service call., Stale selections do not crash the dialog., Tests cover hardening cases.
10. **Out-of-scope:** Do not introduce live collaborative conflict handling., Do not change project/chapter editor behavior.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-002-implement-chapter-selection-ui.
