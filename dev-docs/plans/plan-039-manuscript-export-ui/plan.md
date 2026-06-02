---
title: Manuscript Export UI
slug: plan-039-manuscript-export-ui
version: 0.1.0
status: draft
owner: Planner Agent
created: 2026-06-01
last_updated: 2026-06-01
target_completion: ~
stages: []
dependencies:
  - plan-038-novel-engine-v1
quality_gates:
  - lint
  - typecheck
  - tests
  - check:tokens
---

## Objective

Wire the existing `exportProject()` services in `src/modules/export/services/` to a real
user-facing UI. Authors should be able to export their manuscript to common formats with
a profile selector, format toggle, and chapter-subset selection — without leaving the app.

## Scope

**In scope (draft — refine before stage authoring):**

- Export dialog/panel surface invoked from project hub or editor toolbar.
- Profile selector (e.g., Manuscript Standard, Submission Format, Reader-Friendly).
- Format toggle covering at minimum DOCX, Markdown, and plain text. PDF if the underlying
  driver supports it.
- Chapter-subset selection (range picker, "all", "selected only").
- Progress indication during export and clear success/failure feedback.
- File save via Tauri shell when running in desktop mode; web download fallback.
- Unit tests for UI logic and integration tests for the wiring to `exportProject()`.

**Out of scope:**

- New export formats requiring new drivers.
- Cloud upload / share targets.
- Templating engine for custom export profiles (later).

## Open Questions

- Which export formats are already supported by the existing drivers under
  `src/modules/export/services/`? Confirm before stage authoring.
- Should export live in its own route, or be a modal launched from the hub?
- What is the smallest set of profiles that delivers value at v1? (Manuscript Standard
  is likely the only required one.)

## Stages

To be defined. Likely shape:

| #   | Stage                          | Status   |
| --- | ------------------------------ | -------- |
| 001 | Audit existing export drivers  | `draft`  |
| 002 | Export dialog UI               | `draft`  |
| 003 | Profile + format wiring        | `draft`  |
| 004 | Chapter-subset selection       | `draft`  |
| 005 | Tauri save / web download path | `draft`  |
| 006 | Tests + docs                   | `draft`  |

## Notes

This is a **skeleton draft**. Expand stages, phases, and parts before starting work,
following [`.github/instructions/plan-conventions.instructions.md`](../../../.github/instructions/plan-conventions.instructions.md).

The drivers already exist — this plan is mostly UI + glue, not new export logic.
