---
title: Create manuscript export dialog scaffold
slug: part-001-create-manuscript-export-dialog
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-002-export-dialog-ui
phase: phase-002-ui-scaffold
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.7d
dependencies: ["part-001-spec-export-flow", "part-002-spec-state-machine-accessibility"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Create manuscript export dialog scaffold

## Objective

Create a dedicated manuscript export dialog component with local state, layout, validation shell, and placeholder wiring for later service integration.

## Problem

The existing `ExportModal.svelte` is JSON export focused. Expanding it directly risks a bloated modal that mixes backup portability with manuscript export. A dedicated component keeps responsibilities clear.

## Files

**Create:**

- `src/modules/export/components/ManuscriptExportDialog.svelte`
- `src/modules/export/components/ManuscriptExportDialog.test.ts`

**Update:**

- `src/modules/export/index.ts`

## Required Changes

- Add a new `ManuscriptExportDialog.svelte` component using Svelte 5 runes.
- Accept `projectId`, `open`, and `onClose` props.
- Build static sections for profile, format, metadata, chapter scope, formatting options, and footer actions.
- Use existing constants for format, font family, line spacing, and chapter style options.
- Export the new component from `src/modules/export/index.ts`.

## UI/UX Requirements

- Keep the dialog width near the existing modal maximum but support 92vw.
- Use tokenized spacing, border, radius, surface, and text variables only.
- Use grouped cards or fieldsets for sections.
- Ensure controls are keyboard reachable and labels are explicit.

## Data Requirements

- No service call yet, unless required for project title defaults.
- No persistence in this part.

## Error Handling Requirements

- Include validation placeholder state and accessible error container.
- No service errors yet.

## Tests

- Render closed and open states.
- Assert section headings and primary action exist.
- Assert close callback is called from close control.

## Acceptance Criteria

- [x] New component renders without type errors.
- [x] Existing JSON `ExportModal` remains exported and unchanged unless explicitly split later.
- [x] Component test covers open, closed, and close behavior.
- [x] No hardcoded colors or spacing outside design tokens.

## Out of Scope

- Do not wire actual `exportProject()` in this part.
- Do not delete JSON export behavior.

## Dependencies

- part-001-spec-export-flow
- part-002-spec-state-machine-accessibility

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Create a dedicated manuscript export dialog component with local state, layout, validation shell, and placeholder wiring for later service integration.
2. **Problem:** The existing `ExportModal.svelte` is JSON export focused. Expanding it directly risks a bloated modal that mixes backup portability with manuscript export. A dedicated component keeps responsibilities clear.
3. **Files:** Create: src/modules/export/components/ManuscriptExportDialog.svelte, src/modules/export/components/ManuscriptExportDialog.test.ts. Update: src/modules/export/index.ts.
4. **Changes:** Add a new `ManuscriptExportDialog.svelte` component using Svelte 5 runes., Accept `projectId`, `open`, and `onClose` props., Build static sections for profile, format, metadata, chapter scope, formatting options, and footer actions., Use existing constants for format, font family, line spacing, and chapter style options., Export the new component from `src/modules/export/index.ts`.
5. **UI/UX:** Keep the dialog width near the existing modal maximum but support 92vw., Use tokenized spacing, border, radius, surface, and text variables only., Use grouped cards or fieldsets for sections., Ensure controls are keyboard reachable and labels are explicit.
6. **Data:** No service call yet, unless required for project title defaults., No persistence in this part.
7. **Errors:** Include validation placeholder state and accessible error container., No service errors yet.
8. **Tests:** Render closed and open states., Assert section headings and primary action exist., Assert close callback is called from close control.
9. **Criteria:** New component renders without type errors., Existing JSON `ExportModal` remains exported and unchanged unless explicitly split later., Component test covers open, closed, and close behavior., No hardcoded colors or spacing outside design tokens.
10. **Out-of-scope:** Do not wire actual `exportProject()` in this part., Do not delete JSON export behavior.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-spec-export-flow, part-002-spec-state-machine-accessibility.
