---
title: Constraint Lift and Tool Contract
slug: phase-001-constraint-lift-and-tool-contract
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-004-agentic-tool-loop
parts:
  - part-001-record-plan-030-constraint-lift
  - part-002-define-tool-definition-contracts
estimated_duration: 0.75d
---

# Phase 001 — Constraint Lift and Tool Contract

## Goal

Lock the governance boundary before enabling runtime tool execution.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Record Plan-030 Constraint Lift](part-001-record-plan-030-constraint-lift/part.md) | `complete` | Implementation Agent | 0.25d |
| 002 | [Define Tool Definition Contracts](part-002-define-tool-definition-contracts/part.md) | `complete` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Agent mode advertises tools, parses `tool_use`, dispatches through `tool-router.ts`, feeds `tool_result`, and iterates up to a hard cap.
- [ ] Read tools are pure project-data queries; mutation-like tools return proposal envelopes only.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
