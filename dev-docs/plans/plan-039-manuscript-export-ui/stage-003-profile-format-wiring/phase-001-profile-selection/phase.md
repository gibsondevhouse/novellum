---
title: Profile selection
slug: phase-001-profile-selection
phase_number: 1
status: review
owner: Planner Agent
stage: stage-003-profile-format-wiring
parts:
  - part-001-wire-profile-selector
  - part-002-wire-metadata-fields
estimated_duration: 0.4d
created: 2026-06-01
last_updated: 2026-06-02
---

# Phase 001 — Profile selection

## Goal

Make profile selection real and ensure metadata/front matter defaults follow the selected profile.

## Entry Criteria

- Parent stage is `in-progress` or explicitly approved for parallel execution.
- Prior dependency parts are complete or documented as not required.
- Files named in part scopes are verified against the current branch before editing.

## Parts

| # | Part | Status | Assigned To | Duration |
|---|---|---|---|---|
| 001 | [Wire manuscript profile selector](part-001-wire-profile-selector/part.md) | `review` | Engineering Agent | `0.2d` |
| 002 | [Wire metadata fields and defaults](part-002-wire-metadata-fields/part.md) | `review` | Engineering Agent | `0.2d` |

## Acceptance Criteria

- [x] Every part in this phase reaches `review` with checklist completion.
- [x] Reviewer Agent signs off each part before phase is marked `complete`.
- [x] Evidence exists for each implementation or audit claim.
- [x] Any changed public API is reflected in tests and docs.

## Notes

Do not batch unrelated parts. If a part reveals new scope, document it as a blocker or create a follow-up plan rather than hiding it inside the current implementation.
