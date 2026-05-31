---
title: Test Coverage
slug: phase-001-test-coverage
phase_number: 1
status: review
owner: Planner Agent
stage: stage-003-verification-and-docs
parts:
  - part-001-add-context-priority-regression-tests
estimated_duration: 0.75d
---

## Goal

Add targeted tests that prevent regressions in context-priority payload handling, prompt wiring, validation behavior, and save-path parity.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Add Context-Priority Regression Tests](part-001-add-context-priority-regression-tests/part.md) | `draft` | Reviewer Agent | 0.75d |

## Acceptance Criteria

- [ ] Route tests cover structured context + expanded character schema expectations
- [ ] Unit tests cover candidate extraction and validator behavior
- [ ] Store/service tests cover typed context transport and failure handling

## Notes

Focus on deterministic tests that do not depend on live provider responses.
