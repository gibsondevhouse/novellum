---
title: Roundtrip Testing and Safety
slug: phase-001-roundtrip-testing-and-safety
phase_number: 1
status: ready
owner: Planner Agent
stage: stage-003-quality-and-rollout
parts:
  - part-001-roundtrip-tests-and-guardrails
estimated_duration: 0.5d
---

## Goal

> Prove portability reliability via automated roundtrip coverage and restore guardrails for known failure conditions.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Roundtrip Tests and Guardrails](part-001-roundtrip-tests-and-guardrails/part.md) | `draft` | reviewer | 0.5d |

## Acceptance Criteria

> Phase is complete when all of the following are true.

- [ ] All parts reach `complete` status
- [ ] Test suite verifies export→import roundtrip parity for representative data
- [ ] Validation tests cover corrupt ZIP and manifest mismatch
- [ ] Restore cancellation path is tested and leaves state unchanged
- [ ] Performance envelope is documented for large project fixtures

## Notes

> Roundtrip parity checks should include counts and key representative content, not only presence of files.
