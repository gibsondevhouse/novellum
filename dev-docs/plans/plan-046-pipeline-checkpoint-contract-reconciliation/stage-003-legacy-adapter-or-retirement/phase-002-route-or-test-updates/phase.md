---
title: Route or Test Updates
slug: phase-002-route-or-test-updates
phase_number: 2
status: draft
owner: Planner Agent
stage: stage-003-legacy-adapter-or-retirement
parts:
  - part-001-route-or-test-updates
estimated_duration: TBD
---

## Goal

Apply the compatibility decision to route handlers and tests.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Route or Test Updates](part-001-route-or-test-updates/part.md) | `draft` | — | TBD |

## Acceptance Criteria

- [ ] Supported checkpoint contracts pass tests.
- [ ] Retired contracts have explicit failure tests or no longer appear as supported specs.
- [ ] No tests depend on malformed current fixtures.

## Notes

Update product code or test fixtures so supported contracts pass and retired contracts fail deliberately.
