---
title: Manuscript Export UI
slug: plan-039-manuscript-export-ui
version: 1.0.0
status: complete
owner: Planner Agent
created: 2026-06-01
last_updated: 2026-06-03
target_completion: ~
stages:
  - stage-001-audit-export-stack
  - stage-002-export-dialog-ui
  - stage-003-profile-format-wiring
  - stage-004-chapter-subset-selection
  - stage-005-desktop-web-delivery
  - stage-006-tests-and-docs
dependencies:
  - plan-038-novel-engine-v1
quality_gates:
  - lint
  - typecheck
  - tests
  - check:tokens
  - test:e2e
  - docs_sync
---

# Plan 039 — Manuscript Export UI

## Objective

Wire the existing manuscript export services to a real user-facing export flow. Authors must be able to export a manuscript without leaving the app, choose a supported format, select a manuscript profile, provide metadata, choose which chapters to include, and receive clear feedback for success, cancellation, or failure.

## Initial Repo Grounding

This plan was based on the following observed repo state before implementation:

- `src/modules/export/types.ts` already defines `ExportFormat` as `markdown`, `docx`, `epub`, and `backup_zip`.
- `src/modules/export/types.ts` already defines manuscript profiles as `standard_manuscript`, `reader_copy`, `ebook_draft`, and `plain_text_archive`.
- `src/modules/export/services/export-service.ts` already dispatches to Markdown, DOCX, EPUB, and Backup ZIP drivers.
- `exportProject()` hardcoded compile behavior instead of accepting all UI-selected compile options.
- `assembleManuscript()` already supports chapter filtering through `selectedChapterIds`.
- `src/modules/export/components/ExportModal.svelte` served JSON portability export and copy behavior, not manuscript export UX.
- `src/lib/desktop` exposes a desktop capability surface, but Tauri save methods may still be placeholders. Browser download fallback must remain first-class.

## Product Outcome

A user can open a project, launch `Export manuscript`, choose profile/format/metadata/chapter scope, generate an export, and either download it in web mode or save/download safely when running in desktop mode.

## Implementation Status

Status: `review` as of 2026-06-02. Plan 039 has been implemented and validated, but it is not marked `complete` because Reviewer Agent sign-off is still pending.

Delivered changes:

- Added a dedicated manuscript export dialog while preserving JSON portability export.
- Added typed `ManuscriptExportRequest` service wiring for format, profile, metadata, front/back matter, and selected chapter IDs.
- Added deterministic chapter option and chapter selection helpers.
- Added browser download and desktop-fallback delivery helpers.
- Added service, component, and Playwright coverage for the export flow.
- Updated module documentation and plan evidence.

## Non-Negotiables

1. Do not add PDF export in this plan. There is no confirmed PDF driver in the current export format union.
2. Do not delete or break JSON portability export.
3. Do not invent new storage schemas unless a part explicitly verifies and documents the need.
4. Do not show desktop save cancellation as an error.
5. Do not let an empty selected-chapter list mean “export all.” All-chapter export must be represented distinctly.
6. Do not use hardcoded colors, spacing, or ad hoc UI primitives when existing design tokens/components can be used.
7. Do not mark any part complete without evidence and reviewer sign-off.

## Scope

### In Scope

- Dedicated manuscript export dialog or clearly separated export mode.
- Project-level launch action: `Export manuscript`.
- Format selection for existing supported formats.
- Profile selection for existing manuscript profiles.
- Metadata fields for title, author, subtitle, synopsis, copyright, and dedication.
- Chapter scope controls: all, range, selected chapters.
- Export service contract update so UI-selected compile options reach `assembleManuscript()`.
- Browser download delivery helper.
- Desktop-save fallback policy.
- Component, service, and one narrow e2e test path.
- Module documentation and plan closeout evidence.

### Out of Scope

- PDF export.
- New export drivers.
- Cloud upload/share destinations.
- Custom user-authored export profiles.
- Export history.
- Background export queue.
- Scene-level or beat-level subset export.
- Full native Tauri file-writing implementation if the shell surface is not already ready.

## Assumptions

- Svelte 5 runes remain the required component pattern.
- The project route already has access to a project ID.
- Existing repositories are sufficient to load project and chapter data.
- Backup ZIP is a portability feature and may be visually separated from manuscript output even if technically supported by `ExportFormat`.
- Web download is acceptable as the guaranteed delivery path for this plan.

## Stage Summary

| #   | Stage                                                                    | Status   | Risk     | Duration |
| --- | ------------------------------------------------------------------------ | -------- | -------- | -------- |
| 001 | [Audit export stack](stage-001-audit-export-stack/stage.md)              | `review` | `low`    | `0.5d`   |
| 002 | [Export dialog UI](stage-002-export-dialog-ui/stage.md)                  | `review` | `medium` | `1.5d`   |
| 003 | [Profile and format wiring](stage-003-profile-format-wiring/stage.md)    | `review` | `medium` | `1.0d`   |
| 004 | [Chapter subset selection](stage-004-chapter-subset-selection/stage.md)  | `review` | `medium` | `1.0d`   |
| 005 | [Desktop and web delivery path](stage-005-desktop-web-delivery/stage.md) | `review` | `medium` | `0.75d`  |
| 006 | [Tests and docs](stage-006-tests-and-docs/stage.md)                      | `review` | `low`    | `0.75d`  |

## Quality Gates

- [x] `pnpm run lint`
- [x] `pnpm run check` or repo-equivalent typecheck
- [x] `pnpm run test`
- [x] `pnpm run check:tokens` if available
- [x] Targeted Playwright e2e export flow
- [x] Evidence files created for each part
- [ ] Reviewer Agent sign-off before completion

## Verification Strategy

- Use unit tests for pure request, selection, filename, and delivery helpers.
- Use component tests for dialog state and validation.
- Use one Playwright happy path for route entry and export action.
- Preserve existing JSON export behavior through regression checks.

## Risk Register

| Severity | Risk                                            | Mitigation                                                    |
| -------- | ----------------------------------------------- | ------------------------------------------------------------- |
| High     | UI controls do not reach `assembleManuscript()` | Add typed request and service tests                           |
| High     | JSON export breaks during modal refactor        | Prefer dedicated manuscript dialog; regression test JSON flow |
| Medium   | Desktop save path is not ready                  | Web download fallback; cancel is neutral                      |
| Medium   | Empty selected chapter list exports everything  | Explicit scope model and validation                           |
| Medium   | Unsupported PDF appears in UI                   | Render formats from constants only                            |
| Low      | Metadata defaults feel incomplete               | Ephemeral fields with safe fallbacks                          |

## Completion Definition

Plan 039 is complete only when a reviewer can verify all of the following:

- User-facing manuscript export exists.
- Supported formats match the repo’s export types.
- Selected profile, metadata, and chapter subset affect the generated manuscript.
- Browser download works.
- Desktop save failure/unavailability does not block browser download.
- Empty manuscripts and invalid chapter selections are handled before generation.
- Existing JSON portability export remains usable.
- Required tests and evidence are present.
