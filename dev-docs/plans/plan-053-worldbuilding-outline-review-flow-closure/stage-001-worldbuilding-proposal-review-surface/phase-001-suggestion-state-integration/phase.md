---
title: Suggestion State Integration
slug: phase-001-suggestion-state-integration
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-001-worldbuilding-proposal-review-surface
parts:
  - part-001-wire-suggestion-store-to-routes
  - part-002-add-pending-proposal-badges
estimated_duration: 1d
---

## Goal

Hydrate proposal state from persistence and display pending counts where authors navigate worldbuilding domains.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Wire Suggestion Store To Routes](part-001-wire-suggestion-store-to-routes/part.md) | `draft` | Codex | 0.5d |
| 002 | [Add Pending Proposal Badges](part-002-add-pending-proposal-badges/part.md) | `draft` | Codex | 0.5d |

## Acceptance Criteria

- [ ] refreshSuggestions is called from real route/component lifecycle.
- [ ] Pending counts are consumed by route UI and survive navigation/reload.
- [ ] All parts reach `complete` after real Reviewer Agent sign-off.

## Notes

Phase remains draft until execution begins. Add implementation evidence under each part before moving to review.
