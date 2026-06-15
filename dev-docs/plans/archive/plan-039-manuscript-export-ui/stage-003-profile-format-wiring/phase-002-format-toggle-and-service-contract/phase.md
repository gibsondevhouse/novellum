---
title: Format toggle and service contract
slug: phase-002-format-toggle-and-service-contract
phase_number: 2
status: review
owner: Planner Agent
stage: stage-003-profile-format-wiring
parts:
  - part-001-wire-format-toggle
  - part-002-update-export-service-contract
estimated_duration: 0.6d
created: 2026-06-01
last_updated: 2026-06-02
---

# Phase 002 — Format toggle and service contract

## Goal

Make export format selection real and update the export service so UI-provided compile options reach the assembler.

## Entry Criteria

- Parent stage is `in-progress` or explicitly approved for parallel execution.
- Prior dependency parts are complete or documented as not required.
- Files named in part scopes are verified against the current branch before editing.

## Parts

| # | Part | Status | Assigned To | Duration |
|---|---|---|---|---|
| 001 | [Wire format toggle and presentation options](part-001-wire-format-toggle/part.md) | `review` | Engineering Agent | `0.25d` |
| 002 | [Update export service contract](part-002-update-export-service-contract/part.md) | `review` | Engineering Agent | `0.35d` |

## Acceptance Criteria

- [x] Every part in this phase reaches `review` with checklist completion.
- [x] Reviewer Agent signs off each part before phase is marked `complete`.
- [x] Evidence exists for each implementation or audit claim.
- [x] Any changed public API is reflected in tests and docs.

## Notes

Do not batch unrelated parts. If a part reveals new scope, document it as a blocker or create a follow-up plan rather than hiding it inside the current implementation.
