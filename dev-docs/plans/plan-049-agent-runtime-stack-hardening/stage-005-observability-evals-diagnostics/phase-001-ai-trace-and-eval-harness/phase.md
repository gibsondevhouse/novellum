---
title: AI Trace & Eval Harness
slug: phase-001-ai-trace-and-eval-harness
phase_number: 1
status: draft
owner: Planner Agent
stage: stage-005-observability-evals-diagnostics
parts:
  - part-001-ai-trace-and-eval-harness
estimated_duration: TBD
---

## Goal

Add local AI trace records and deterministic eval fixtures for runtime-critical flows.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [AI Trace & Eval Harness](part-001-ai-trace-and-eval-harness/part.md) | `draft` | unassigned | TBD |

## Acceptance Criteria

- [ ] Runtime-critical prompts, model metadata, tool calls, parser outcomes, and usage are traceable with redaction.
- [ ] Eval fixtures cover outline, author draft, worldbuilding, tool routing, budget rejection, and malformed provider output.
- [ ] Tests can run without live provider calls.

## Notes

Trace enough to debug contracts. Do not create a hidden telemetry system.
