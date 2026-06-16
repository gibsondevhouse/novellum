---
title: Route And Help Integration
slug: phase-002-route-and-help-integration
phase_number: 2
status: review
owner: Planner Agent
stage: stage-002-worldbuilding-generation-execution-state
parts:
  - part-001-wire-main-worldbuilding-generate-controls
  - part-002-wire-help-route-generate-controls
estimated_duration: 1.5d
---

## Goal

Apply the generation action contract to the main worldbuilding route and help route without duplicating logic.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Wire Main Worldbuilding Generate Controls](part-001-wire-main-worldbuilding-generate-controls/part.md) | `review` | Codex | 0.75d |
| 002 | [Wire Help Route Generate Controls](part-002-wire-help-route-generate-controls/part.md) | `review` | Codex | 0.75d |

## Acceptance Criteria

- [x] Both main and help routes use the same generation action service.
- [x] Status widgets reflect actual domain state.
- [ ] All parts reach `complete` after real Reviewer Agent sign-off.

## Notes

Phase remains draft until execution begins. Add implementation evidence under each part before moving to review.
