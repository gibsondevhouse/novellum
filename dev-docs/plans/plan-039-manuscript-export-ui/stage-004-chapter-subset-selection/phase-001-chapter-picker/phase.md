---
title: Chapter picker
slug: phase-001-chapter-picker
phase_number: 1
status: review
owner: Planner Agent
stage: stage-004-chapter-subset-selection
parts:
  - part-001-load-ordered-chapters
  - part-002-implement-chapter-selection-ui
estimated_duration: 0.65d
created: 2026-06-01
last_updated: 2026-06-02
---

# Phase 001 — Chapter picker

## Goal

Load ordered chapters and build the selection UI/state model.

## Entry Criteria

- Parent stage is `in-progress` or explicitly approved for parallel execution.
- Prior dependency parts are complete or documented as not required.
- Files named in part scopes are verified against the current branch before editing.

## Parts

| # | Part | Status | Assigned To | Duration |
|---|---|---|---|---|
| 001 | [Load ordered chapters for export](part-001-load-ordered-chapters/part.md) | `review` | Engineering Agent | `0.25d` |
| 002 | [Implement chapter selection UI](part-002-implement-chapter-selection-ui/part.md) | `review` | Engineering Agent | `0.4d` |

## Acceptance Criteria

- [x] Every part in this phase reaches `review` with checklist completion.
- [x] Reviewer Agent signs off each part before phase is marked `complete`.
- [x] Evidence exists for each implementation or audit claim.
- [x] Any changed public API is reflected in tests and docs.

## Notes

Do not batch unrelated parts. If a part reveals new scope, document it as a blocker or create a follow-up plan rather than hiding it inside the current implementation.
