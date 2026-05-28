---
title: Stage 001 - Outline Hierarchy Foundation
slug: stage-001-outline-hierarchy-foundation
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-028-v1.1-hierarchical-pipeline-ui
phases:
  - phase-001-pipeline-hierarchy-path-contract
  - phase-002-seven-layer-navigator-upgrade
  - phase-003-scope-header-and-detail-shell
estimated_duration: 6d
risk_level: high
started_at: 2026-05-26T15:45:42Z
---

## Goal

Establish the strict seven-layer selection and navigation foundation so stage orchestration can only run on valid Arc -> Stage scope.

## Phases

| #   | Phase | Status  | Est. Duration |
| --- | ----- | ------- | ------------- |
| 001 | [Pipeline Hierarchy Path Contract](phase-001-pipeline-hierarchy-path-contract/phase.md) | `complete` | 2d |
| 002 | [Seven-Layer Navigator Upgrade](phase-002-seven-layer-navigator-upgrade/phase.md) | `complete` | 2d |
| 003 | [Scope Header and Detail Shell](phase-003-scope-header-and-detail-shell/phase.md) | `complete` | 2d |

## Entry Criteria

- Plan-027 contracts and checkpoint lifecycle are complete and stable.
- Outline route remains the primary execution surface.

## Exit Criteria

- Arc -> Stage selection is representable only via valid parent chains.
- Navigator and detail shell consistently expose full active path context.
- No stage-level controls appear when `stageId` is absent.

## Notes

This stage is foundational; downstream stages assume these invariants and should not re-implement path logic.
