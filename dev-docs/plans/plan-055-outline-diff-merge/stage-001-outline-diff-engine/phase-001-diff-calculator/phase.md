---
title: Diff Calculation Logic
slug: phase-001-diff-calculator
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-001-outline-diff-engine
parts:
  - part-001-outline-diff-engine-service
estimated_duration: 2d
---

## Goal

Build the server-side comparison engine to align generated drafts and database tables.

## Parts

| #   | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Outline Diff Engine Service](part-001-outline-diff-engine-service/part.md) | `complete` | — | 2d |

## Acceptance Criteria

- [x] All parts reach `complete`
- [x] Engine returns clean JSON lists of differences.
- [x] Recursive matching of acts, chapters, and scenes is fully tested.

## Notes

> Phase-level context for Diff Calculation Logic.
