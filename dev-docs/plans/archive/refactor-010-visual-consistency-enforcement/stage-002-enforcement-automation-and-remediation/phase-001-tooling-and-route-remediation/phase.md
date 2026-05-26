---
title: Tooling and Route Remediation
slug: phase-001-tooling-and-route-remediation
phase_number: 1
status: complete
owner: Planner Agent
stage: stage-002-enforcement-automation-and-remediation
parts:
  - part-001-static-token-and-primitive-enforcement
  - part-002-visual-regression-suite-and-thresholds
  - part-003-route-family-consistency-remediation
estimated_duration: 4d
---

## Goal

Build automated enforcement and eliminate visual inconsistencies across all inventoried UI surfaces.

## Parts

|#|Part|Status|Assigned To|Est. Duration|
|---|---|---|---|---|
|001|[Static Token and Primitive Enforcement](part-001-static-token-and-primitive-enforcement/part.md)|`complete`|Frontend Agent|1d|
|002|[Visual Regression Suite and Thresholds](part-002-visual-regression-suite-and-thresholds/part.md)|`complete`|Frontend Agent|1d|
|003|[Route-Family Consistency Remediation](part-003-route-family-consistency-remediation/part.md)|`complete`|Frontend Agent|2d|

## Acceptance Criteria

- [x] Static checks fail correctly on violations
- [x] Visual regression checks cover all route families
- [x] Route-family remediation reaches visual parity
- [x] All surfaces in the registry are marked compliant (0 pending, 0 unreviewed)
