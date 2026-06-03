---
title: Wire export entry point
slug: part-002-wire-entry-point
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-002-export-dialog-ui
phase: phase-002-ui-scaffold
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.4d
dependencies: ["part-001-create-manuscript-export-dialog"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Wire export entry point

## Objective

Expose the manuscript export dialog from the project experience without duplicating backup/export actions.

## Problem

The user needs a visible way to export a manuscript. The entry point must not collide with JSON backup actions or create multiple competing export affordances.

## Files

**Create:**

- None.

**Update:**

- `src/routes/projects/[id]/+layout.svelte`
- `src/routes/projects/[id]/+page.svelte`
- `src/modules/export/index.ts`

## Required Changes

- Choose one primary launch location from the project hub or project layout toolbar based on current route structure.
- Add an `Export manuscript` action that opens `ManuscriptExportDialog`.
- Keep the existing JSON backup/export action available but visually separate if it remains in the same menu.
- Use state local to the route/layout for dialog open/close.
- Avoid adding duplicate controls across hub and editor unless product decision requires both.

## UI/UX Requirements

- Entry label must say `Export manuscript` rather than generic `Export` when a separate backup action exists.
- Button/menu placement must match surrounding route action patterns.
- No new visual primitive unless an existing button or menu primitive cannot handle the interaction.

## Data Requirements

- Pass current project ID from route params or loaded project data.
- Do not fetch project twice in the route if load data already has it.

## Error Handling Requirements

- If project ID is unavailable, action must not render or must be disabled with a clear title.

## Tests

- Route/component test verifies entry action opens dialog.
- Regression test verifies existing JSON export action still appears if it existed before.

## Acceptance Criteria

- [x] `Export manuscript` is discoverable from the selected project surface.
- [x] Clicking the action opens the new dialog.
- [x] Closing the dialog restores normal route state.
- [x] No duplicate export entry points are introduced without documented rationale.

## Out of Scope

- Do not wire generation/download yet.
- Do not change navigation architecture.

## Dependencies

- part-001-create-manuscript-export-dialog

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Expose the manuscript export dialog from the project experience without duplicating backup/export actions.
2. **Problem:** The user needs a visible way to export a manuscript. The entry point must not collide with JSON backup actions or create multiple competing export affordances.
3. **Files:** Create: None. Update: src/routes/projects/[id]/+layout.svelte, src/routes/projects/[id]/+page.svelte, src/modules/export/index.ts.
4. **Changes:** Choose one primary launch location from the project hub or project layout toolbar based on current route structure., Add an `Export manuscript` action that opens `ManuscriptExportDialog`., Keep the existing JSON backup/export action available but visually separate if it remains in the same menu., Use state local to the route/layout for dialog open/close., Avoid adding duplicate controls across hub and editor unless product decision requires both.
5. **UI/UX:** Entry label must say `Export manuscript` rather than generic `Export` when a separate backup action exists., Button/menu placement must match surrounding route action patterns., No new visual primitive unless an existing button or menu primitive cannot handle the interaction.
6. **Data:** Pass current project ID from route params or loaded project data., Do not fetch project twice in the route if load data already has it.
7. **Errors:** If project ID is unavailable, action must not render or must be disabled with a clear title.
8. **Tests:** Route/component test verifies entry action opens dialog., Regression test verifies existing JSON export action still appears if it existed before.
9. **Criteria:** `Export manuscript` is discoverable from the selected project surface., Clicking the action opens the new dialog., Closing the dialog restores normal route state., No duplicate export entry points are introduced without documented rationale.
10. **Out-of-scope:** Do not wire generation/download yet., Do not change navigation architecture.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-create-manuscript-export-dialog.
