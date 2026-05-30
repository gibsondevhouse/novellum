---
title: Read-Only Project Tools
slug: phase-002-read-only-project-tools
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-004-agentic-tool-loop
parts:
  - part-001-register-project-summary-tool
  - part-002-register-entity-read-tools
estimated_duration: 1.25d
---

# Phase 002 — Read-Only Project Tools

## Goal

Register pure project-data tools that let Agent mode inspect project state without mutation rights.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Register Project Summary Tool](part-001-register-project-summary-tool/part.md) | `complete` | Implementation Agent | 0.25d |
| 002 | [Register Entity Read Tools](part-002-register-entity-read-tools/part.md) | `complete` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Agent mode advertises tools, parses `tool_use`, dispatches through `tool-router.ts`, feeds `tool_result`, and iterates up to a hard cap.
- [ ] Read tools are pure project-data queries; mutation-like tools return proposal envelopes only.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
