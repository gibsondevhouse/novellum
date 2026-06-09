---
title: Quality Gates
slug: phase-002-quality-gates
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-004-full-e2e-closure
parts:
  - part-001-quality-gates
estimated_duration: TBD
---

## Goal

Run standard repo quality gates after e2e closure.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Quality Gates](part-001-quality-gates/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] All required gates pass.
- [ ] Evidence includes command outputs.
- [ ] Any unrelated blocker is documented with exact file/line.

## Notes

Ensure checkpoint contract reconciliation did not regress type, lint, test, or token baselines.
