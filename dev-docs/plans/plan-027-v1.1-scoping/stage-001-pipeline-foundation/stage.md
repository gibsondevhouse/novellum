---
title: Stage 001 - Pipeline Foundation
slug: stage-001-pipeline-foundation
stage_number: 1
status: draft
owner: Planner Agent
plan: plan-027-v1.1-scoping
phases:
  - phase-001-orchestrator-contract
  - phase-002-prompt-library-and-templates
  - phase-003-schema-extension-scope
estimated_duration: 7d
risk_level: medium
---

## Goal

Define the execution contract and persistence foundation for staged fiction generation before shipping any user-facing stage handlers.

## Phases

| #   | Phase                                                                        | Status  | Est. Duration |
| --- | ---------------------------------------------------------------------------- | ------- | ------------- |
| 001 | [Orchestrator Contract](phase-001-orchestrator-contract/phase.md)            | `draft` | 2d            |
| 002 | [Prompt Library and Templates](phase-002-prompt-library-and-templates/phase.md) | `draft` | 2d            |
| 003 | [Schema Extension Scope](phase-003-schema-extension-scope/phase.md)          | `draft` | 3d            |

## Entry Criteria

- Research baseline and schema verification docs are reviewed.
- Plan-027 is the active plan in `ACTIVE-PLAN.md`.

## Exit Criteria

- All phases complete
- Worldbuild/author stage contracts are typed and test-backed
- Schema extension scope is explicitly approved or explicitly deferred

## Notes

This stage is where the hierarchy correction is locked into contracts. No downstream phase should re-interpret the outline shape.
