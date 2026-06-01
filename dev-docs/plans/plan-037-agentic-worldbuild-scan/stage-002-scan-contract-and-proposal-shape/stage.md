---
title: Scan Contract & Proposal Data Shape
slug: stage-002-scan-contract-and-proposal-shape
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-037-agentic-worldbuild-scan
phases:
  - phase-001-define-scan-context-contract
  - phase-002-define-proposal-schema-and-dedupe
  - phase-003-define-validation-and-error-contract
estimated_duration: 2d
risk_level: high
---

## Goal

Define and lock the scan/proposal contract (inputs, outputs, validation, dedupe, and error semantics) before any UI or mutation-path implementation begins.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Define Scan Context Contract](phase-001-define-scan-context-contract/phase.md) | `complete` | 0.5d |
| 002 | [Define Proposal Schema & Dedupe](phase-002-define-proposal-schema-and-dedupe/phase.md) | `complete` | 0.75d |
| 003 | [Define Validation & Error Contract](phase-003-define-validation-and-error-contract/phase.md) | `complete` | 0.75d |

## Entry Criteria

- Stage 001 governance reconciliation is complete.
- Existing worldbuilding generation/checkpoint contracts are inventoried.

## Exit Criteria

- Proposal payload schema is documented and represented in typed contracts.
- Dedupe strategy is defined with deterministic keys.
- Validation and user-safe error contract is documented and testable.

## Notes

No UI behavior should be implemented in this stage before contract alignment is complete.
