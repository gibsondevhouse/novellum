---
title: UX Consistency
slug: stage-003-ux-consistency
stage_number: 3
status: complete
owner: engineering
plan: refactor-006-frontend-production-readiness
phases:
  - phase-001-feedback-systems
  - phase-002-loading-states
  - phase-003-navigation
estimated_duration: 3d
risk_level: medium
---

## Goal

Deliver a consistent, polished user experience across the entire app by standardising how feedback (toasts, empty states), loading states, and navigation (breadcrumbs, routing) are communicated to users.

## Phases

| # | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Feedback Systems](./phase-001-feedback-systems/phase-001-feedback-systems.md) | `draft` | 1d |
| 002 | [Loading States](./phase-002-loading-states/phase-002-loading-states.md) | `draft` | 1d |
| 003 | [Navigation Consistency](./phase-003-navigation/phase-003-navigation.md) | `draft` | 1d |

## Entry Criteria

- Stage 001 and Stage 002 are `complete`.

## Exit Criteria

- All phases complete.
- No route renders a blank content area while data loads.
- No route shows a raw error without user guidance.
- All `window.location.href` usages replaced with `goto()`.

## Notes

The toast service MUST be implemented (Phase 001, Part 001) before any other part in this stage, because Parts 002 (empty state) and Phase 002 reference it.
