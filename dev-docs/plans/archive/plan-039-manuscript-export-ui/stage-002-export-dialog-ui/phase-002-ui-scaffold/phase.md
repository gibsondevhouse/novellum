---
title: UI scaffold
slug: phase-002-ui-scaffold
phase_number: 2
status: review
owner: Planner Agent
stage: stage-002-export-dialog-ui
parts:
  - part-001-create-manuscript-export-dialog
  - part-002-wire-entry-point
estimated_duration: 1.1d
created: 2026-06-01
last_updated: 2026-06-02
---

# Phase 002 — UI scaffold

## Goal

Create the actual manuscript export dialog and wire it to a discoverable entry point with non-destructive integration.

## Entry Criteria

- Parent stage is `in-progress` or explicitly approved for parallel execution.
- Prior dependency parts are complete or documented as not required.
- Files named in part scopes are verified against the current branch before editing.

## Parts

| # | Part | Status | Assigned To | Duration |
|---|---|---|---|---|
| 001 | [Create manuscript export dialog scaffold](part-001-create-manuscript-export-dialog/part.md) | `review` | Engineering Agent | `0.7d` |
| 002 | [Wire export entry point](part-002-wire-entry-point/part.md) | `review` | Engineering Agent | `0.4d` |

## Acceptance Criteria

- [x] Every part in this phase reaches `review` with checklist completion.
- [x] Reviewer Agent signs off each part before phase is marked `complete`.
- [x] Evidence exists for each implementation or audit claim.
- [x] Any changed public API is reflected in tests and docs.

## Notes

Do not batch unrelated parts. If a part reveals new scope, document it as a blocker or create a follow-up plan rather than hiding it inside the current implementation.
