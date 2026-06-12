---
title: Source Contract Tests
slug: phase-003-source-contract-tests
phase_number: 3
status: review
owner: Planner Agent
stage: stage-002-tool-policy-contract
parts:
  - part-001-source-contract-tests
estimated_duration: TBD
---

## Goal

Add source-contract tests that prevent future mutation tool regressions.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Source Contract Tests](part-001-source-contract-tests/part.md) | `review` | — | TBD |

## Acceptance Criteria

- [x] Tests fail if `authorDraft.accept_checkpoint` is model-callable.
- [x] Tests fail if a mutation tool omits mutation metadata.
- [x] Source-contract coverage is documented.

## Notes

Make it mechanically hard to register model-callable tools that import or invoke mutation APIs.
