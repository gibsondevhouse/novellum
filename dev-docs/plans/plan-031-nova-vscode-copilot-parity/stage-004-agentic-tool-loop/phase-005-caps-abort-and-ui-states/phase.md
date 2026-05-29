---
title: Caps, Abort, and UI States
slug: phase-005-caps-abort-and-ui-states
phase_number: 5
status: complete
owner: Planner Agent
stage: stage-004-agentic-tool-loop
parts:
  - part-001-implement-agent-step-cap-and-abort
  - part-002-render-tool-chips-and-agent-plan
estimated_duration: 0.75d
---

# Phase 005 — Caps, Abort, and UI States

## Goal

Prevent runaway token burn and make Agent mode observable to the user.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Implement Agent Step Cap and Abort](part-001-implement-agent-step-cap-and-abort/part.md) | `complete` | Implementation Agent | 0.25d |
| 002 | [Render Tool Chips and Agent Plan](part-002-render-tool-chips-and-agent-plan/part.md) | `complete` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Agent mode advertises tools, parses `tool_use`, dispatches through `tool-router.ts`, feeds `tool_result`, and iterates up to a hard cap.
- [ ] Read tools are pure project-data queries; mutation-like tools return proposal envelopes only.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
