---
title: Quality Gates
slug: phase-001-quality-gates
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-005-verification-docs-closeout
parts:
  - part-001-run-required-quality-gates
  - part-002-verify-global-acceptance-criteria
estimated_duration: 0.75d
---

# Phase 001 — Quality Gates

## Goal

Run and record the full verification command set.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Run Required Quality Gates](part-001-run-required-quality-gates/part.md) | `complete` | Implementation Agent | 0.25d |
| 002 | [Verify Global Acceptance Criteria](part-002-verify-global-acceptance-criteria/part.md) | `complete` | Implementation Agent | 0.25d |

## Acceptance Criteria

- [ ] All parts reach `complete` after reviewer signoff.
- [ ] All required quality gates pass or have a documented waiver accepted by Reviewer Agent.
- [ ] `dev-docs/04-modules/nova.md` and `dev-docs/03-ai/pipeline.md` reflect the shipped mode, attachment, and Agent loop contracts.

## Notes

- Phase status derives from child part statuses.
- Do not skip evidence creation; every complete part needs at least one artifact.
