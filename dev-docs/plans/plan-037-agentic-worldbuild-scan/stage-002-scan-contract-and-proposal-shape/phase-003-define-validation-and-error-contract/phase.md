---
title: Define Validation & Error Contract
slug: phase-003-define-validation-and-error-contract
phase_number: 3
status: complete
owner: Planner Agent
stage: stage-002-scan-contract-and-proposal-shape
parts:
  - part-001-specify-validation-and-error-semantics
estimated_duration: 0.75d
---

## Goal

Define Validation & Error Contract for plan-037 while preserving review-gated canon safety.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Specify Validation & Error Semantics](part-001-specify-validation-and-error-semantics/part.md) | `complete` | Claude Code | 0.75d |

## Acceptance Criteria

- [x] schema validation failure behavior is explicit for API and UI
- [x] user-safe error copy and developer diagnostics are both defined

## Notes

This phase should remain scoped to the parent stage only and avoid cross-stage spillover.
