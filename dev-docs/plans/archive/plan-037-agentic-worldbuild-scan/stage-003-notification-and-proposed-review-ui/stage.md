---
title: UI Notification & Proposed-Review Flow
slug: stage-003-notification-and-proposed-review-ui
stage_number: 3
status: complete
owner: Planner Agent
plan: plan-037-agentic-worldbuild-scan
phases:
  - phase-001-derive-pending-suggestion-state
  - phase-002-add-category-notification-badges
  - phase-003-build-proposed-review-surfaces
estimated_duration: 2.5d
risk_level: medium
---

## Goal

Surface pending suggestions clearly in worldbuilding navigation and category review surfaces with explicit non-canonical visual affordances and complete state handling.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Derive Pending Suggestion State](phase-001-derive-pending-suggestion-state/phase.md) | `complete` | 0.75d |
| 002 | [Add Category Notification Badges](phase-002-add-category-notification-badges/phase.md) | `complete` | 0.75d |
| 003 | [Build Proposed Review Surfaces](phase-003-build-proposed-review-surfaces/phase.md) | `complete` | 1d |

## Entry Criteria

- Stage 002 contract/schema outputs are finalized and available.
- Notification/badge target surfaces are identified in navigation and domain routes.

## Exit Criteria

- Category notification dots/badges reflect persisted pending proposal state.
- Pending/proposed visual states are distinct from accepted canon states.
- Empty/loading/failed/review-ready/accepted/rejected states are explicit in UI.

## Notes

Copy and visual treatment must preserve author agency and avoid auto-canon implication.
