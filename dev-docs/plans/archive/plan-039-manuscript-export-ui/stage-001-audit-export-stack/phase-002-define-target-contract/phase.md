---
title: Define target contract
slug: phase-002-define-target-contract
phase_number: 2
status: review
owner: Planner Agent
stage: stage-001-audit-export-stack
parts:
  - part-001-define-manuscript-export-contract
estimated_duration: 0.25d
created: 2026-06-01
last_updated: 2026-06-02
---

# Phase 002 — Define target contract

## Goal

Convert inventory into a precise implementation contract for the rest of the plan.

## Entry Criteria

- Parent stage is `in-progress` or explicitly approved for parallel execution.
- Prior dependency parts are complete or documented as not required.
- Files named in part scopes are verified against the current branch before editing.

## Parts

| # | Part | Status | Assigned To | Duration |
|---|---|---|---|---|
| 001 | [Define manuscript export contract](part-001-define-manuscript-export-contract/part.md) | `review` | Engineering Agent | `0.25d` |

## Acceptance Criteria

- [x] Every part in this phase reaches `review` with checklist completion.
- [x] Reviewer Agent signs off each part before phase is marked `complete`.
- [x] Evidence exists for each implementation or audit claim.
- [x] Any changed public API is reflected in tests and docs.

## Notes

Do not batch unrelated parts. If a part reveals new scope, document it as a blocker or create a follow-up plan rather than hiding it inside the current implementation.
