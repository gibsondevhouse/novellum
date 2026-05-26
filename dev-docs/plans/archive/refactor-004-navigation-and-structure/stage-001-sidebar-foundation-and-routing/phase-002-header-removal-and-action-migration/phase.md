---
title: Header Removal & Action Migration
slug: phase-002-header-removal-and-action-migration
phase_number: 2
status: draft
owner: Frontend Agent
stage: stage-001-sidebar-foundation-and-routing
parts:
  - part-001-remove-project-header
  - part-002-migrate-utility-actions
estimated_duration: 1d
---

## Goal

Remove the `.project-header` element and all its children from the project layout. Delete `ProjectModeSwitcher.svelte`. Move project utility actions (edit, export, delete) from the header toolbar to a contextual action group within the Hub surface page.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Remove Project Header](part-001-remove-project-header/part.md) | `draft` | Frontend Agent | 0.5d |
| 002 | [Migrate Utility Actions](part-002-migrate-utility-actions/part.md) | `draft` | Frontend Agent | 0.5d |

## Acceptance Criteria

- [ ] `src/routes/projects/[id]/+layout.svelte` renders no `<header>` element
- [ ] `ProjectModeSwitcher.svelte` file deleted from `src/lib/components/`
- [ ] All header-related CSS removed from layout and global stylesheet
- [ ] Edit, Export, and Delete actions are accessible from the Hub surface page
- [ ] `getContext('projectActions')` pattern for `openEdit` and `openDelete` preserved in Hub page
- [ ] No TypeScript errors introduced by removed imports
- [ ] `pnpm run check` exits clean

## Notes

- The Hub page already receives `openEdit` via `getContext('projectActions')` — this mechanism stays intact; only the trigger location changes (header → Hub page actions area)
- Export logic lives in `src/modules/export/`; the trigger button can be a simple call to the export store's/service's open method from the Hub page
- Delete uses the existing `DeleteProjectDialog.svelte` component triggered via context — keep this pattern
