---
title: Agent Mode Regression
slug: phase-001-agent-mode-regression
phase_number: 1
status: review
owner: Planner Agent
stage: stage-004-regression-and-docs
parts:
  - part-001-agent-mode-regression
estimated_duration: TBD
---

## Goal

Prove Agent mode remains useful after mutation tools are removed from model advertisement.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Agent Mode Regression](part-001-agent-mode-regression/part.md) | `review` | Codex | TBD |

## Acceptance Criteria

- [x] Agent mode can still call read/generate tools.
- [x] Mutation tools are absent from advertised payloads.
- [x] Command output evidence is captured.

## Notes

Verify read and generation tools still work while mutation tools are excluded.
