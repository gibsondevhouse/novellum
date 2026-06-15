---
title: Observability, Evals & Diagnostics
slug: stage-005-observability-evals-diagnostics
stage_number: 5
status: complete
owner: Planner Agent
plan: plan-049-agent-runtime-stack-hardening
phases:
  - phase-001-ai-trace-and-eval-harness
  - phase-002-diagnostics-and-closeout
estimated_duration: TBD
risk_level: high
---

## Goal

Make agent runtime behavior inspectable, testable, diagnosable, and safe to support without remote telemetry.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [AI Trace & Eval Harness](phase-001-ai-trace-and-eval-harness/phase.md) | `draft` | TBD |
| 002 | [Diagnostics & Closeout](phase-002-diagnostics-and-closeout/phase.md) | `draft` | TBD |

## Entry Criteria

- Durable run ledger, worker lifecycle, model capability registry, and search baseline are complete.
- Runtime records can be redacted for diagnostics.

## Exit Criteria

- AI traces and eval fixtures can reproduce important runtime contracts without live provider calls.
- Diagnostics can be exported locally with clear redaction.
- Final docs and quality gates prove the stack hardening work is production-ready.

## Notes

This stage closes the infrastructure loop: if a run fails, the app should be able to explain what happened without sending private writing data to a remote service.
