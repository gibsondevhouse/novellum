---
title: Routing Fix
slug: phase-001-routing-fix
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-003-routing-sidebar
parts:
  - part-001-fix-path-detection
estimated_duration: 0.5d
---

## Goal

Improve sidebar path-detection logic to reliably identify the active project across all route families.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Fix Path Detection](part-001-fix-path-detection/part.md) | `draft` | — | 0.5d |

## Acceptance Criteria

- [ ] All parts reach `complete` status
- [ ] Sidebar active-state detection handles all route patterns
- [ ] Unit tests added for edge cases
- [ ] Tests pass for canonical and non-canonical routes

## Notes

Test coverage is the key here. Add unit tests that exercise the path-detection logic across
different route families (projects, settings, etc.) to prevent future regressions.
