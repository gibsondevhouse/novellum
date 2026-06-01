---
title: Expand Unit & API Coverage
slug: phase-001-expand-unit-and-api-coverage
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-005-hardening-tests-docs-and-evidence
parts:
  - part-001-add-scan-contract-dedupe-and-api-test-coverage
estimated_duration: 0.5d
---

## Goal

Expand Unit & API Coverage for plan-037 while preserving review-gated canon safety.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add Scan Contract, Dedupe, and API Test Coverage](part-001-add-scan-contract-dedupe-and-api-test-coverage/part.md) | `complete` | Claude Code | 0.5d |

## Acceptance Criteria

- [x] unit tests cover schema validation and dedupe behavior
- [x] API tests cover no-credentials, bad schema, duplicate, and success paths

## Notes

This phase should remain scoped to the parent stage only and avoid cross-stage spillover.
