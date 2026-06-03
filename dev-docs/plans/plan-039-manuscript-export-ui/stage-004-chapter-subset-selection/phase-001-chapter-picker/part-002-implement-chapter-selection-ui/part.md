---
title: Implement chapter selection UI
slug: part-002-implement-chapter-selection-ui
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-004-chapter-subset-selection
phase: phase-001-chapter-picker
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.4d
dependencies: ["part-001-load-ordered-chapters"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Implement chapter selection UI

## Objective

Implement all/range/selected chapter scope controls and map them to `selectedChapterIds` for export.

## Problem

Authors need subset export, but the request must be deterministic and safe. Empty arrays and undefined chapter IDs have different meanings and must not be conflated.

## Files

**Create:**

- `src/modules/export/components/ChapterSubsetSelector.svelte`
- `src/modules/export/components/chapter-selection.ts`
- `src/modules/export/components/chapter-selection.test.ts`

**Update:**

- `src/modules/export/components/ManuscriptExportDialog.svelte`
- `src/modules/export/components/ManuscriptExportDialog.test.ts`

## Required Changes

- Add scope options: all chapters, chapter range, selected chapters.
- Build a pure helper that converts UI scope into `selectedChapterIds`.
- For all chapters, pass `undefined` or omit selected IDs according to contract.
- For range, derive IDs from ordered chapter options inclusively.
- For selected, preserve manuscript order rather than click order.

## UI/UX Requirements

- Show chapter count and selected count.
- Disable export when selected/range resolves to zero chapters.
- Range selectors must not allow invalid start/end pairs without correction or validation.

## Data Requirements

- Selection state remains local to dialog.
- Export request uses IDs only, not full chapter objects.

## Error Handling Requirements

- Empty selected scope shows validation error, not service failure.
- Missing chapters after a project edit must revalidate before export.

## Tests

- All scope resolves to undefined selected IDs.
- Range resolves inclusive ordered IDs.
- Selected resolves ordered IDs.
- Empty selected/range state blocks export.

## Acceptance Criteria

- [x] Chapter selector renders all/range/selected modes.
- [x] Resolved selected IDs are deterministic.
- [x] Validation blocks zero-chapter export.
- [x] Tests cover helper edge cases.

## Out of Scope

- Do not add scene-level export selection.
- Do not add drag-reorder behavior.

## Dependencies

- part-001-load-ordered-chapters

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Implement all/range/selected chapter scope controls and map them to `selectedChapterIds` for export.
2. **Problem:** Authors need subset export, but the request must be deterministic and safe. Empty arrays and undefined chapter IDs have different meanings and must not be conflated.
3. **Files:** Create: src/modules/export/components/ChapterSubsetSelector.svelte, src/modules/export/components/chapter-selection.ts, src/modules/export/components/chapter-selection.test.ts. Update: src/modules/export/components/ManuscriptExportDialog.svelte, src/modules/export/components/ManuscriptExportDialog.test.ts.
4. **Changes:** Add scope options: all chapters, chapter range, selected chapters., Build a pure helper that converts UI scope into `selectedChapterIds`., For all chapters, pass `undefined` or omit selected IDs according to contract., For range, derive IDs from ordered chapter options inclusively., For selected, preserve manuscript order rather than click order.
5. **UI/UX:** Show chapter count and selected count., Disable export when selected/range resolves to zero chapters., Range selectors must not allow invalid start/end pairs without correction or validation.
6. **Data:** Selection state remains local to dialog., Export request uses IDs only, not full chapter objects.
7. **Errors:** Empty selected scope shows validation error, not service failure., Missing chapters after a project edit must revalidate before export.
8. **Tests:** All scope resolves to undefined selected IDs., Range resolves inclusive ordered IDs., Selected resolves ordered IDs., Empty selected/range state blocks export.
9. **Criteria:** Chapter selector renders all/range/selected modes., Resolved selected IDs are deterministic., Validation blocks zero-chapter export., Tests cover helper edge cases.
10. **Out-of-scope:** Do not add scene-level export selection., Do not add drag-reorder behavior.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-load-ordered-chapters.
