---
title: Baseline Audit and Visual Target
slug: stage-001-baseline-audit
stage_number: 1
status: in-progress
owner: Planner / Reviewer
plan: plan-015-cinematic-media
phases:
  - phase-001-audit-capture
estimated_duration: 2d
risk_level: low
---

# Stage-001: Baseline Audit and Visual Target

## Goal

Create the implementation baseline for the cinematic UI refactor: route inventory, screenshot inventory, token debt map, seeded QA fixture, and release-quality visual target notes. No production UI refactor work should start until this stage is complete.

## Entry Criteria

- `plan-015-cinematic-media.md` is accepted as the source of truth.
- The current app can run locally with `pnpm run dev`.
- The implementer has reviewed `ui-consistency.md`, `dev-docs/design-system.md`, and `tests/visual/visual-regression.test.ts`.

## Phases

| # | Phase | Status | Owner | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Audit Capture](phase-001-audit-capture/phase-001-audit-capture.md) | `in-progress` | Planner / Reviewer | 2d |

## Required Deliverables

- `audit/route-inventory.md` listing every visible route, shared shell surface, modal/drawer, and state variant.
- `audit/token-debt-map.md` with every `check:tokens` violation and undefined token reference mapped to file/line and remediation category.
- `audit/seed-fixture.md` describing the seeded project data needed for repeatable project-route screenshots.
- Screenshot evidence for app-level and seeded project-level baseline surfaces.
- A written target-state note for each route family: shell, library, project hub, world-building, workflows, and verification.

## Exit Criteria

- Every current visible surface has an audit entry.
- Token debt is classified by hardcoded color, hardcoded shadow, hardcoded motion, undefined token, or allowed exception.
- Project-level visual testing can run against a documented repeatable fixture.
- Stage 002 has enough information to fix token debt without rediscovering the current baseline.

## Notes

The audit should capture both empty and populated states. Treat redirect and coming-soon routes as visible surfaces because users can still encounter them during navigation.
