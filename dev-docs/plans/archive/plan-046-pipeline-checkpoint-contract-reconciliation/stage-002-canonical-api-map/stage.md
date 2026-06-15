---
title: Canonical API Map
slug: stage-002-canonical-api-map
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-046-pipeline-checkpoint-contract-reconciliation
phases:
  - phase-001-family-route-map
  - phase-002-lifecycle-operation-map
  - phase-003-version-policy
estimated_duration: TBD
risk_level: high
---

## Goal

Define the supported API contract for worldbuild checkpoints, worldbuilding proposals, author draft checkpoints, and outline checkpoints.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Family Route Map](phase-001-family-route-map/phase.md) | `complete` | TBD |
| 002 | [Lifecycle Operation Map](phase-002-lifecycle-operation-map/phase.md) | `complete` | TBD |
| 003 | [Version Policy](phase-003-version-policy/phase.md) | `complete` | TBD |

## Entry Criteria

- Stage 001 audit is complete.
- Product owner accepts which pipeline families are still supported.

## Exit Criteria

- Canonical routes and request/response shapes are documented.
- Generic metadata lifecycle support is either retained with clear compatibility rules or marked for retirement.
- Schema version expectations are explicit for tests and clients.

## Notes

Family route ownership, lifecycle operation map, and version policy completed 2026-06-12. Stage 003 can now update or retire stale compatibility surfaces against the documented contract.
