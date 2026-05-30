---
title: Agentic Tests and Source Contracts
slug: phase-006-agentic-tests-and-source-contracts
phase_number: 6
status: complete
owner: Planner Agent
stage: stage-004-agentic-tool-loop
parts:
  - part-001-add-agentic-loop-tests
  - part-002-add-no-mutation-import-source-contract
estimated_duration: 0.5d
---

# Phase 006 — Agentic Tests and Source Contracts

## Goal

Prove Agent mode is real, bounded, and cannot mutate manuscript/editor paths through tools.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add Agentic Loop Tests](part-001-add-agentic-loop-tests/part.md) | `complete` | Implementation Agent | 0.25d |
| 002 | [Add No-Mutation Import Source Contract](part-002-add-no-mutation-import-source-contract/part.md) | `complete` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Agent mode advertises tools, parses `tool_use`, dispatches through `tool-router.ts`, feeds `tool_result`, and iterates up to a hard cap.
- [ ] Read tools are pure project-data queries; mutation-like tools return proposal envelopes only.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
