---
title: Routing & Sidebar Path Detection
slug: stage-003-routing-sidebar
stage_number: 3
status: draft
owner: Planner Agent
plan: plan-042-quality-gates-closure
phases:
  - phase-001-routing-fix
estimated_duration: 0.5d
risk_level: low
---

## Goal

Fix the brittle sidebar / active-project detection path-parsing for routes outside the
canonical `/projects/<id>/...` pattern. This ensures robust sidebar state across all navigation routes.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Routing Fix](phase-001-routing-fix/phase.md) | `draft` | 0.5d |

## Entry Criteria

- Stage-001 and Stage-002 are complete
- Routing logic documented in `dev-docs/02-architecture/routing.md`
- Test environment ready

## Exit Criteria

- All phases complete
- Sidebar active-state detection works for all route families
- Unit tests added for non-canonical routes
- All quality gates passed

## Notes

The current sidebar detection logic may have edge cases for routes that don't follow the
`/projects/<id>/...` pattern. This stage adds robustness and test coverage to prevent
regressions as new routes are added.
