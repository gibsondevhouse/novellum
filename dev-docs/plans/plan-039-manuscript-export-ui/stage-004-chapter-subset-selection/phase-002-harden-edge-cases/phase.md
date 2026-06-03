---
title: Harden edge cases
slug: phase-002-harden-edge-cases
phase_number: 2
status: review
owner: Planner Agent
stage: stage-004-chapter-subset-selection
parts:
  - part-001-harden-chapter-selection-edge-cases
  - part-002-wire-selection-to-export-request
estimated_duration: 0.35d
created: 2026-06-01
last_updated: 2026-06-02
---

# Phase 002 — Harden edge cases

## Goal

Handle empty manuscripts, stale selections, missing chapter titles, and race conditions before export generation.

## Entry Criteria

- Parent stage is `in-progress` or explicitly approved for parallel execution.
- Prior dependency parts are complete or documented as not required.
- Files named in part scopes are verified against the current branch before editing.

## Parts

| # | Part | Status | Assigned To | Duration |
|---|---|---|---|---|
| 001 | [Harden chapter selection edge cases](part-001-harden-chapter-selection-edge-cases/part.md) | `review` | Engineering Agent | `0.2d` |
| 002 | [Wire chapter selection to export request](part-002-wire-selection-to-export-request/part.md) | `review` | Engineering Agent | `0.15d` |

## Acceptance Criteria

- [x] Every part in this phase reaches `review` with checklist completion.
- [x] Reviewer Agent signs off each part before phase is marked `complete`.
- [x] Evidence exists for each implementation or audit claim.
- [x] Any changed public API is reflected in tests and docs.

## Notes

Do not batch unrelated parts. If a part reveals new scope, document it as a blocker or create a follow-up plan rather than hiding it inside the current implementation.
