---
title: Runtime Contract Spec
slug: phase-002-runtime-contract-spec
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-001-runtime-inventory-and-contract
parts:
  - part-001-runtime-contract-spec
estimated_duration: TBD
---

## Goal

Define the canonical runtime state machine and data contract before adding persistence or worker behavior.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Runtime Contract Spec](part-001-runtime-contract-spec/part.md) | `complete` | Codex | TBD |

## Acceptance Criteria

- [x] Runtime lifecycle states are defined for runs, steps, jobs, tool calls, artifacts, cancellations, retries, and failures.
- [x] Review-gated mutation boundaries are explicit in the runtime contract.
- [x] The contract maps current runtime paths to future schema and service owners.

## Notes

The spec should prevent later stages from hard-coding state machines differently in separate modules.
