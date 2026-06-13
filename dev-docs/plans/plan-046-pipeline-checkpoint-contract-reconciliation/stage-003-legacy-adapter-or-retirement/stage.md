---
title: Legacy Adapter or Retirement
slug: stage-003-legacy-adapter-or-retirement
stage_number: 3
status: complete
owner: Planner Agent
plan: plan-046-pipeline-checkpoint-contract-reconciliation
phases:
  - phase-001-compatibility-decision
  - phase-002-route-or-test-updates
  - phase-003-hidden-caller-sweep
estimated_duration: TBD
risk_level: high
---

## Goal

Either preserve legacy checkpoint behavior intentionally through adapters or retire it cleanly from routes, clients, and tests.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Compatibility Decision](phase-001-compatibility-decision/phase.md) | `complete` | TBD |
| 002 | [Route or Test Updates](phase-002-route-or-test-updates/phase.md) | `complete` | TBD |
| 003 | [Hidden Caller Sweep](phase-003-hidden-caller-sweep/phase.md) | `complete` | TBD |

## Entry Criteria

- Stage 002 canonical API map is approved.

## Exit Criteria

- Legacy behavior is either adapter-backed and tested or removed from supported contracts.
- Tests use current artifact envelopes and route shapes.
- Source search confirms no active caller depends on retired paths.

## Notes

Completed 2026-06-12. Stale Plan-028 fixtures were updated to the current `PipelineArtifactEnvelope` contract instead of adding legacy adapters; proposal decision helpers now include project context; source sweep found no active caller that depends on retired checkpoint contracts.
