---
title: Wire progress, success, and error states
slug: part-001-wire-progress-success-error-states
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-005-desktop-web-delivery
phase: phase-002-feedback-states
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.3d
dependencies: ["part-002-desktop-save-fallback", "part-002-wire-selection-to-export-request"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Wire progress, success, and error states

## Objective

Connect the dialog primary action to export generation and delivery with robust user feedback.

## Problem

Until the dialog calls `exportProject()` and delivery helpers, it is only a form. The final UX needs deterministic state transitions and a safe retry path.

## Files

**Create:**

- None.

**Update:**

- `src/modules/export/components/ManuscriptExportDialog.svelte`
- `src/modules/export/components/ManuscriptExportDialog.test.ts`

## Required Changes

- On primary action, validate state and build export request.
- Call `exportProject()` with the typed request.
- Pass returned blob and filename to delivery helper.
- Display progress text while generating and delivering.
- Display success, cancelled, and failed states with retry support.

## UI/UX Requirements

- Disable mutable controls while export is generating.
- Keep Close available unless an unsafe operation is in progress.
- Success message must include filename.
- Failure message must include next action, not stack trace.

## Data Requirements

- Request is built from current UI state only.
- No generated blob is stored after delivery completes.

## Error Handling Requirements

- Validation failure stops before service call.
- Generation failure maps to export error.
- Delivery failure maps to delivery error.
- Cancel maps to neutral state.

## Tests

- Successful export calls service and delivery helper.
- Validation failure does not call service.
- Generation failure shows error.
- Delivery cancel shows neutral state.
- Retry clears prior error.

## Acceptance Criteria

- [x] Dialog can complete a real manuscript export.
- [x] Loading, success, cancel, and failure states are visible and accessible.
- [x] User can retry after failure.
- [x] Tests cover success and failure states.

## Out of Scope

- Do not add background export queue.
- Do not add export history.

## Dependencies

- part-002-desktop-save-fallback
- part-002-wire-selection-to-export-request

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Connect the dialog primary action to export generation and delivery with robust user feedback.
2. **Problem:** Until the dialog calls `exportProject()` and delivery helpers, it is only a form. The final UX needs deterministic state transitions and a safe retry path.
3. **Files:** Create: None. Update: src/modules/export/components/ManuscriptExportDialog.svelte, src/modules/export/components/ManuscriptExportDialog.test.ts.
4. **Changes:** On primary action, validate state and build export request., Call `exportProject()` with the typed request., Pass returned blob and filename to delivery helper., Display progress text while generating and delivering., Display success, cancelled, and failed states with retry support.
5. **UI/UX:** Disable mutable controls while export is generating., Keep Close available unless an unsafe operation is in progress., Success message must include filename., Failure message must include next action, not stack trace.
6. **Data:** Request is built from current UI state only., No generated blob is stored after delivery completes.
7. **Errors:** Validation failure stops before service call., Generation failure maps to export error., Delivery failure maps to delivery error., Cancel maps to neutral state.
8. **Tests:** Successful export calls service and delivery helper., Validation failure does not call service., Generation failure shows error., Delivery cancel shows neutral state., Retry clears prior error.
9. **Criteria:** Dialog can complete a real manuscript export., Loading, success, cancel, and failure states are visible and accessible., User can retry after failure., Tests cover success and failure states.
10. **Out-of-scope:** Do not add background export queue., Do not add export history.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-002-desktop-save-fallback, part-002-wire-selection-to-export-request.
