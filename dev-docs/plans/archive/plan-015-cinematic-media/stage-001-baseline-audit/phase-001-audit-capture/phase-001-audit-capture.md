---
title: Audit Capture
slug: phase-001-audit-capture
phase_number: 1
status: in-progress
owner: Planner / Reviewer
stage: stage-001-baseline-audit
parts:
  - part-001-route-screenshots
  - part-002-token-debt-map
estimated_duration: 2d
---

# Phase-001: Audit Capture

## Goal

Produce the factual current-state inventory required for a controlled production UI refactor.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Route Screenshots and Inventory](part-001-route-screenshots.md) | `in-progress` | Planner / Reviewer | 1d |
| 002 | [Token Violation Classification](part-002-token-debt-map.md) | `in-progress` | Stylist / Reviewer | 1d |

## Implementation Strategy

Run the audit before UI edits. Capture enough detail that later stages can execute without rediscovering routes, states, screenshots, token debt, and fixtures. Store audit artifacts under `dev-docs/plans/plan-015-cinematic-media/audit/` and screenshot/evidence artifacts under route-family subfolders.

## Acceptance Criteria

- [ ] Route inventory includes app-level, project-level, world-building, redirect, placeholder, modal, drawer, empty, loading, and error surfaces.
- [ ] Token debt map includes `pnpm run check:tokens` output plus undefined-token references from static search.
- [ ] Seed fixture requirements are documented and sufficient for project-route visual tests.
- [ ] Audit artifacts are linked from Stage 001.

## Edge Cases

- Dynamic routes must be captured with populated, sparse, and empty data where feasible.
- Mobile collapsed shell states must be captured because shell regressions can hide primary navigation.
