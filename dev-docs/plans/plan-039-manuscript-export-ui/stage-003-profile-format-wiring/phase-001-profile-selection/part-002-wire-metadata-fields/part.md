---
title: Wire metadata fields and defaults
slug: part-002-wire-metadata-fields
part_number: 2
status: review
owner: Planner Agent
assigned_to: Engineering Agent
plan: plan-039-manuscript-export-ui
stage: stage-003-profile-format-wiring
phase: phase-001-profile-selection
started_at: 2026-06-02
completed_at: ~
estimated_duration: 0.2d
dependencies: ["part-001-wire-profile-selector"]
created: 2026-06-01
last_updated: 2026-06-02
---

# Part 002 — Wire metadata fields and defaults

## Objective

Add metadata controls for title, author, subtitle, synopsis, copyright, and optional dedication.

## Problem

Manuscript export cannot produce a credible title page or EPUB metadata without author/title fields. Current service sets title from the project and leaves author empty.

## Files

**Create:**

- `src/modules/export/components/ManuscriptMetadataFields.svelte`

**Update:**

- `src/modules/export/components/ManuscriptExportDialog.svelte`
- `src/modules/export/components/ManuscriptExportDialog.test.ts`

## Required Changes

- Create metadata fields component typed to `ManuscriptMetadata`.
- Default title from project title when available.
- Keep author optional but visible.
- Use synopsis textarea only when profile or format benefits from it.
- Normalize empty strings before building the export request.

## UI/UX Requirements

- Keep title and author above optional fields.
- Collapse optional metadata behind an advanced/details section if vertical space is tight.
- Use helper text for metadata fields that affect title page or EPUB.

## Data Requirements

- Do not persist author/project metadata unless a repository already exists for it.
- Ephemeral metadata is acceptable for this plan.

## Error Handling Requirements

- Title must fall back to project title or `Untitled Manuscript`.
- Filename generation must not depend on raw unsanitized metadata.

## Tests

- Default title renders from project input.
- Editing author updates request state.
- Empty optional metadata is omitted or normalized.

## Acceptance Criteria

- [x] Metadata fields render and update typed dialog state.
- [x] Title default is stable.
- [x] Empty metadata does not break export request construction.
- [x] Tests cover metadata update path.

## Out of Scope

- Do not add project schema fields in this part.
- Do not require author to export.

## Dependencies

- part-001-wire-profile-selector

## Verification Notes

- Capture real command output or audit findings in `evidence/`.
- Update `impl.log.md` after implementation.
- Keep `checklist.md` synchronized with actual work performed.
- Leave status as `draft` until implementation begins.


## Coding Agent Prompt

1. **Objective:** Add metadata controls for title, author, subtitle, synopsis, copyright, and optional dedication.
2. **Problem:** Manuscript export cannot produce a credible title page or EPUB metadata without author/title fields. Current service sets title from the project and leaves author empty.
3. **Files:** Create: src/modules/export/components/ManuscriptMetadataFields.svelte. Update: src/modules/export/components/ManuscriptExportDialog.svelte, src/modules/export/components/ManuscriptExportDialog.test.ts.
4. **Changes:** Create metadata fields component typed to `ManuscriptMetadata`., Default title from project title when available., Keep author optional but visible., Use synopsis textarea only when profile or format benefits from it., Normalize empty strings before building the export request.
5. **UI/UX:** Keep title and author above optional fields., Collapse optional metadata behind an advanced/details section if vertical space is tight., Use helper text for metadata fields that affect title page or EPUB.
6. **Data:** Do not persist author/project metadata unless a repository already exists for it., Ephemeral metadata is acceptable for this plan.
7. **Errors:** Title must fall back to project title or `Untitled Manuscript`., Filename generation must not depend on raw unsanitized metadata.
8. **Tests:** Default title renders from project input., Editing author updates request state., Empty optional metadata is omitted or normalized.
9. **Criteria:** Metadata fields render and update typed dialog state., Title default is stable., Empty metadata does not break export request construction., Tests cover metadata update path.
10. **Out-of-scope:** Do not add project schema fields in this part., Do not require author to export.
11. **Format:** Return changed files, implementation notes, tests run, evidence files created, and any blockers. Do not mark the part complete without reviewer sign-off.

Dependencies: part-001-wire-profile-selector.
