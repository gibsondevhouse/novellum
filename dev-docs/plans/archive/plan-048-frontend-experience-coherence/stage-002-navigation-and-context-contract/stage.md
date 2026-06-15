---
title: Navigation & Context Contract
slug: stage-002-navigation-and-context-contract
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-048-frontend-experience-coherence
phases:
  - phase-001-route-state-contract
  - phase-002-shell-and-panel-model
estimated_duration: 2h
risk_level: high
---

## Goal

Make project, chapter, scene, route, and Nova context visible and predictable across the app.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Route State Contract](phase-001-route-state-contract/phase.md) | `complete` | 1h |
| 002 | [Shell & Panel Model](phase-002-shell-and-panel-model/phase.md) | `complete` | 1h |

## Entry Criteria

- Stage 001 inventory and workflow map are complete.
- Plan 044 route context changes are complete or accepted as stable enough to design against.

## Exit Criteria

- Active context has one source-of-truth contract for routes, stores, and visible UI.
- Shell and panel behavior is documented for global, project, and workspace routes.
- Tests cover navigation and context-sensitive Nova behavior.

## Notes

This stage should prevent query-param-only context, invisible active project drift, and confusing global versus scoped Nova behavior.
