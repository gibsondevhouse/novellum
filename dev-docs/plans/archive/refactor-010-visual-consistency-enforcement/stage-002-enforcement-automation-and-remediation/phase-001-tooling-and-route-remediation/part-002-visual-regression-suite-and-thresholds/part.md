---
title: Visual Regression Suite and Thresholds
slug: part-002-visual-regression-suite-and-thresholds
part_number: 2
status: review
owner: Planner Agent
assigned_to: Frontend Agent
phase: phase-001-tooling-and-route-remediation
started_at: 2026-04-14
completed_at: 2026-04-14
estimated_duration: 1d
---

## Objective

Create visual regression checks to detect route-family UI drift.

## Scope

**In scope:**

- Baseline capture for representative routes
- Threshold and diff policy
- Workflow docs for running and updating baselines

**Out of scope:**

- Full end-to-end behavioral testing

## Implementation Steps

1. Select route snapshots per family.
2. Configure comparison thresholds.
3. Add run/update instructions.
4. Capture sample diff evidence.

## Files

**Create:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-002-enforcement-automation-and-remediation/phase-001-tooling-and-route-remediation/part-002-visual-regression-suite-and-thresholds/evidence/visual-regression-baseline-2026-04-14.md`

**Update:**

- `dev-docs/plans/refactor-010-visual-consistency-enforcement/stage-002-enforcement-automation-and-remediation/phase-001-tooling-and-route-remediation/part-002-visual-regression-suite-and-thresholds/impl.log.md`

## Acceptance Criteria

- [ ] Visual suite covers route families in scope
- [ ] Thresholds are documented and reproducible
- [ ] Failure output supports quick remediation
