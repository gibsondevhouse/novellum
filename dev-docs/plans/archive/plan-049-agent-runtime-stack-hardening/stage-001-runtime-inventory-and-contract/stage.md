---
title: Runtime Inventory & Contract
slug: stage-001-runtime-inventory-and-contract
stage_number: 1
status: complete
owner: Planner Agent
plan: plan-049-agent-runtime-stack-hardening
phases:
  - phase-001-agent-surface-inventory
  - phase-002-runtime-contract-spec
estimated_duration: TBD
risk_level: medium
---

## Goal

Map the current AI runtime surfaces and define the durable contract that all later runtime hardening must follow.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Agent Surface Inventory](phase-001-agent-surface-inventory/phase.md) | `complete` | TBD |
| 002 | [Runtime Contract Spec](phase-002-runtime-contract-spec/phase.md) | `complete` | TBD |

## Entry Criteria

- Current Nova, outline, author draft, worldbuilding, provider, and checkpoint paths are available for source audit.
- Plans 043-048 exist as the current roadmap context.

## Exit Criteria

- [x] Every AI runtime path has an owner, entrypoint, persistence model, and review/mutation classification.
- [x] A runtime contract exists for run, step, tool-call, artifact, review gate, cancellation, retry, and error states.
- [x] Later stages can implement schemas and services without rediscovering runtime behavior.

## Notes

This stage should be observational and contractual. Do not start database or worker implementation until the runtime contract is accepted.
