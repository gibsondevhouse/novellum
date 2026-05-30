---
title: Proposal-Only Mutation-Like Tools
slug: phase-003-proposal-only-tools
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-004-agentic-tool-loop
parts:
  - part-001-define-proposal-envelope-reuse
  - part-002-register-proposal-tools
estimated_duration: 1.25d
---

# Phase 003 — Proposal-Only Mutation-Like Tools

## Goal

Expose useful authoring actions while guaranteeing Nova never auto-applies changes.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Define Proposal Envelope Reuse](part-001-define-proposal-envelope-reuse/part.md) | `complete` | Implementation Agent | 0.25d |
| 002 | [Register Proposal Tools](part-002-register-proposal-tools/part.md) | `complete` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] Agent mode advertises tools, parses `tool_use`, dispatches through `tool-router.ts`, feeds `tool_result`, and iterates up to a hard cap.
- [ ] Read tools are pure project-data queries; mutation-like tools return proposal envelopes only.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
