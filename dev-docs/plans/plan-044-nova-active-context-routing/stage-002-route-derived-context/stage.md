---
title: Route-Derived Context
slug: stage-002-route-derived-context
stage_number: 2
status: draft
owner: Planner Agent
plan: plan-044-nova-active-context-routing
phases:
  - phase-001-context-source-design
  - phase-002-normalization-helper
  - phase-003-query-override-policy
estimated_duration: TBD
risk_level: medium
---

## Goal

Implement a canonical source of active Nova context derived from route params, page data, or a shared context store.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Context Source Design](phase-001-context-source-design/phase.md) | `draft` | TBD |
| 002 | [Normalization Helper](phase-002-normalization-helper/phase.md) | `draft` | TBD |
| 003 | [Query Override Policy](phase-003-query-override-policy/phase.md) | `draft` | TBD |

## Entry Criteria

- Stage 001 identifies all context sources and consumers.
- The expanded plan chooses whether to use layout data, route params, store state, or a small helper.

## Exit Criteria

- Normal editor and project routes provide consistent active context.
- Query parameters remain supported only where intentionally useful.
- Context resolution is unit-testable without rendering the whole app shell.

## Notes

Avoid spreading route parsing logic across components. Prefer one tested context resolution boundary.

