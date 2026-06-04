---
title: Conflict Policy & Audit
slug: phase-002-conflict-policy-and-audit
phase_number: 2
status: complete
owner: Planner Agent
stage: stage-004-accept-materialization-and-conflict-safety
parts:
  - part-001-implement-existing-outline-conflict-preflight
  - part-002-add-stale-guard-and-audit-metadata
  - part-003-recover-from-materialization-failures
estimated_duration: 1.5d
---

## Goal

Prevent destructive outline application and maintain audit-grade lifecycle data for accept/reject decisions.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Implement Existing Outline Conflict Preflight](part-001-implement-existing-outline-conflict-preflight/part.md) | `complete` | Backend Agent | 0.5d |
| 002 | [Add Stale Guard and Audit Metadata](part-002-add-stale-guard-and-audit-metadata/part.md) | `complete` | Backend Agent | 0.5d |
| 003 | [Recover From Materialization Failures](part-003-recover-from-materialization-failures/part.md) | `complete` | Backend Agent | 0.5d |

## Acceptance Criteria

- [x] All parts reach `complete` with evidence artifacts.
- [x] Phase implementation remains inside declared repo/module boundaries.
- [x] Any deviation from planned files is documented in the relevant `impl.log.md`.
- [x] Required tests for the phase pass or have a reviewer-approved waiver.

## Notes

Treat this phase as blocked if an upstream contract is missing or contradicts current source. Source code wins over stale documentation; capture the mismatch in evidence before proceeding.
