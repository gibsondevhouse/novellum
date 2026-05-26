---
title: localStorage Audit and Migration
slug: phase-002-localstorage-audit-and-migration
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-002-sqlite-source-of-truth
parts:
  - part-001-localstorage-audit
  - part-002-project-data-to-sqlite
  - part-003-app-preferences-store
estimated_duration: 1.5d
---

## Goal

Eliminate `localStorage` as a storage layer for project-owned data. All project data moves to SQLite via `/api/db/*`; app-level preferences move to a single `app_preferences` SQLite table accessed through a typed preferences service.

## Parts

| #   | Part                                                                                   | Status  | Assigned To | Est. Duration |
| --- | -------------------------------------------------------------------------------------- | ------- | ----------- | ------------- |
| 001 | [localStorage Audit](part-001-localstorage-audit/part.md)                              | `draft` | backend     | 0.5d          |
| 002 | [Project Data to SQLite](part-002-project-data-to-sqlite/part.md)                      | `draft` | backend     | 0.5d          |
| 003 | [App Preferences Store](part-003-app-preferences-store/part.md)                        | `draft` | backend     | 0.5d          |

## Acceptance Criteria

- [ ] An audit document enumerates every `localStorage` call site under `src/` with classification: `project-data`, `app-preference`, or `legacy-portability`.
- [ ] Every `project-data` call site is replaced by `/api/db/*` writes.
- [ ] Every `app-preference` call site is replaced by reads/writes through the new preferences service.
- [ ] No new `localStorage.setItem` calls remain in `src/modules/**` for project-owned data.
- [ ] `pnpm run lint` and `pnpm run test` pass.

## Notes

- Confirmed call sites at audit time include: `SceneClarityPanel.svelte`, `ChapterOutlinePanel.svelte`, `SceneOutlineForm.svelte`, `ChapterClarityPanel.svelte`, `ChapterOutlineForm.svelte`, `editor/+page.svelte` (definition + quickIntent), `world-building/lineages/+page.svelte`, `world-building/factions/+page.svelte`, plus portability snapshot/restore which is allowed to keep reading/writing localStorage as part of the legacy export bundle.
- Outliner clarity panel data (goal/conflict/outcome/notes/function/turn/revelation) maps to a new `scene_clarity` / `chapter_clarity` table or columns on `scenes`/`chapters` — the audit decides.
