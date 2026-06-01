---
title: Define Proposal Schema & Dedupe
slug: phase-002-define-proposal-schema-and-dedupe
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-002-scan-contract-and-proposal-shape
parts:
  - part-001-specify-proposal-schema-and-dedupe-rules
estimated_duration: 0.75d
---

## Goal

Define Proposal Schema & Dedupe for plan-037 while preserving review-gated canon safety.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Specify Proposal Schema & Dedupe Rules](part-001-specify-proposal-schema-and-dedupe-rules/part.md) | `complete` | Claude Code | 0.75d |

## Acceptance Criteria

- [x] proposal payload includes provenance, lifecycle, and category-scoped data
- [x] dedupe keys and duplicate handling semantics are deterministic

## Notes

This phase should remain scoped to the parent stage only and avoid cross-stage spillover.
