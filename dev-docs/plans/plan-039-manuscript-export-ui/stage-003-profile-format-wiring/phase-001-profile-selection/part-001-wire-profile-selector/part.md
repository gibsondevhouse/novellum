---
title: Wire manuscript profile selector
slug: part-001-wire-profile-selector
part_number: 1
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-003-profile-format-wiring
phase: phase-001-profile-selection
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.2d
dependencies: ["part-001-create-manuscript-export-dialog"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 001 — Wire manuscript profile selector

## Objective

Bind the dialog profile selector to `MANUSCRIPT_PROFILES` and update compile defaults when the user changes profile.

## Problem

Profiles already exist in the module, but the current export service hardcodes `reader_copy`. The UI must expose profiles and carry the selected ID into the eventual service call.

## Files

**Create:**

- `src/modules/export/components/ManuscriptProfileSelector.svelte`

**Update:**

- `src/modules/export/components/ManuscriptExportDialog.svelte`
- `src/modules/export/components/ManuscriptExportDialog.test.ts`

## Required Changes

- Create a small selector component backed by `MANUSCRIPT_PROFILES`.
- Default to `standard_manuscript` unless contract evidence requires another default.
- When profile changes, update front/back matter defaults unless the user has explicitly overridden them.
- Display profile label and short description.
- Keep profile ID typed as `ManuscriptProfileId`.

## UI/UX Requirements

- Use radio cards or a select only if width forces compression.
- Descriptions must be concise and non-technical.
- Selected state must be visible beyond color alone.

## Data Requirements

- No persistence yet.
- State must be typed and serializable into the eventual export request.

## Error Handling Requirements

- Unknown profile ID should fall back to `standard_manuscript` in UI state initialization.

## Tests

- Changing profile updates selected profile ID.
- Profile defaults update front/back matter when not manually overridden.
- Unknown/default behavior is covered if helper exists.

## Acceptance Criteria

- [x] All profile options render from `MANUSCRIPT_PROFILES`.
- [x] Selected profile is carried in dialog state.
- [x] Profile description is visible and accessible.
- [x] Tests cover profile selection behavior.

## Out of Scope

- Do not modify profile definitions unless inventory proves they are wrong.
- Do not implement custom user-created profiles.

## Dependencies

- part-001-create-manuscript-export-dialog

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Bind the dialog profile selector to `MANUSCRIPT_PROFILES` and update compile defaults when the user changes profile.
2. **Problem:** Profiles already exist in the module, but the current export service hardcodes `reader_copy`. The UI must expose profiles and carry the selected ID into the eventual service call.
3. **Files:** Create: src/modules/export/components/ManuscriptProfileSelector.svelte. Update: src/modules/export/components/ManuscriptExportDialog.svelte, src/modules/export/components/ManuscriptExportDialog.test.ts.
4. **Changes:** Create a small selector component backed by `MANUSCRIPT_PROFILES`., Default to `standard_manuscript` unless contract evidence requires another default., When profile changes, update front/back matter defaults unless the user has explicitly overridden them., Display profile label and short description., Keep profile ID typed as `ManuscriptProfileId`.
5. **UI/UX:** Use radio cards or a select only if width forces compression., Descriptions must be concise and non-technical., Selected state must be visible beyond color alone.
6. **Data:** No persistence yet., State must be typed and serializable into the eventual export request.
7. **Errors:** Unknown profile ID should fall back to `standard_manuscript` in UI state initialization.
8. **Tests:** Changing profile updates selected profile ID., Profile defaults update front/back matter when not manually overridden., Unknown/default behavior is covered if helper exists.
9. **Criteria:** All profile options render from `MANUSCRIPT_PROFILES`., Selected profile is carried in dialog state., Profile description is visible and accessible., Tests cover profile selection behavior.
10. **Out-of-scope:** Do not modify profile definitions unless inventory proves they are wrong., Do not implement custom user-created profiles.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-create-manuscript-export-dialog.
