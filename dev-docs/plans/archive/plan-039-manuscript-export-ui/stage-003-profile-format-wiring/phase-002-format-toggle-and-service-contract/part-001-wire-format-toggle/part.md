---
title: Wire format toggle and presentation options
slug: part-001-wire-format-toggle
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-003-profile-format-wiring
phase: phase-002-format-toggle-and-service-contract
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.25d
dependencies: ["part-001-wire-profile-selector"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Wire format toggle and presentation options

## Objective

Bind the format toggle and presentation controls to existing export constants.

## Problem

The UI must only present formats and formatting controls that the module supports. It must also avoid unsupported claims like PDF export unless a driver exists.

## Files

**Create:**

- `src/modules/export/components/ExportFormatSelector.svelte`
- `src/modules/export/components/ExportFormattingOptions.svelte`

**Update:**

- `src/modules/export/components/ManuscriptExportDialog.svelte`
- `src/modules/export/components/ManuscriptExportDialog.test.ts`

## Required Changes

- Render formats from `EXPORT_FORMAT_OPTIONS`.
- Render formatting options from `FONT_FAMILY_OPTIONS`, `LINE_SPACING_OPTIONS`, and `CHAPTER_STYLE_OPTIONS`.
- Default options from `DEFAULT_EXPORT_SETTINGS`.
- Do not render PDF.
- Disable irrelevant formatting controls for `backup_zip` if backup ZIP remains in this dialog.

## UI/UX Requirements

- Use a segmented control, radio cards, or compact grid matching existing visual primitives.
- Label Backup ZIP as project backup, not manuscript output, if shown.
- Group advanced formatting below main format/profile controls.

## Data Requirements

- Format state typed as `ExportFormat`.
- Presentation options typed as `ExportOptions`.

## Error Handling Requirements

- Unsupported format state should be impossible at compile time and defensively rejected at runtime.

## Tests

- All supported formats render.
- PDF does not render.
- Formatting options update state.
- Backup ZIP disables manuscript-specific controls if applicable.

## Acceptance Criteria

- [x] Format selector uses constants, not duplicated arrays.
- [x] Default export options match constants.
- [x] Tests cover format and option changes.
- [x] No unsupported format appears in UI.

## Out of Scope

- Do not implement new drivers.
- Do not add PDF export.

## Dependencies

- part-001-wire-profile-selector

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Bind the format toggle and presentation controls to existing export constants.
2. **Problem:** The UI must only present formats and formatting controls that the module supports. It must also avoid unsupported claims like PDF export unless a driver exists.
3. **Files:** Create: src/modules/export/components/ExportFormatSelector.svelte, src/modules/export/components/ExportFormattingOptions.svelte. Update: src/modules/export/components/ManuscriptExportDialog.svelte, src/modules/export/components/ManuscriptExportDialog.test.ts.
4. **Changes:** Render formats from `EXPORT_FORMAT_OPTIONS`., Render formatting options from `FONT_FAMILY_OPTIONS`, `LINE_SPACING_OPTIONS`, and `CHAPTER_STYLE_OPTIONS`., Default options from `DEFAULT_EXPORT_SETTINGS`., Do not render PDF., Disable irrelevant formatting controls for `backup_zip` if backup ZIP remains in this dialog.
5. **UI/UX:** Use a segmented control, radio cards, or compact grid matching existing visual primitives., Label Backup ZIP as project backup, not manuscript output, if shown., Group advanced formatting below main format/profile controls.
6. **Data:** Format state typed as `ExportFormat`., Presentation options typed as `ExportOptions`.
7. **Errors:** Unsupported format state should be impossible at compile time and defensively rejected at runtime.
8. **Tests:** All supported formats render., PDF does not render., Formatting options update state., Backup ZIP disables manuscript-specific controls if applicable.
9. **Criteria:** Format selector uses constants, not duplicated arrays., Default export options match constants., Tests cover format and option changes., No unsupported format appears in UI.
10. **Out-of-scope:** Do not implement new drivers., Do not add PDF export.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-wire-profile-selector.
