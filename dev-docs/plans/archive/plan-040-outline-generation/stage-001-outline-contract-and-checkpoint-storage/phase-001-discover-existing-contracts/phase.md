---
title: Discover Existing Contracts
slug: phase-001-discover-existing-contracts
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-001-outline-contract-and-checkpoint-storage
parts:
  - part-001-audit-outline-worldbuild-and-draft-contracts
  - part-002-define-outline-draft-contract
estimated_duration: 0.5d
---

## Goal

Audit existing outline, worldbuilding, checkpoint, project metadata, and draft context contracts so plan-040 extends shipped patterns instead of inventing parallel APIs.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Audit Outline, Worldbuild, and Draft Contracts](part-001-audit-outline-worldbuild-and-draft-contracts/part.md) | `complete` | Architect Agent | 0.25d |
| 002 | [Define OutlineDraft Contract](part-002-define-outline-draft-contract/part.md) | `complete` | AI Agent | 0.25d |

## Acceptance Criteria

- [x] All parts reach `complete` with evidence artifacts.
- [x] Phase implementation remains inside declared repo/module boundaries.
- [x] Any deviation from planned files is documented in the relevant `impl.log.md`.
- [x] Required tests for the phase pass or have a reviewer-approved waiver.

## Notes

Treat this phase as blocked if an upstream contract is missing or contradicts current source. Source code wins over stale documentation; capture the mismatch in evidence before proceeding.
