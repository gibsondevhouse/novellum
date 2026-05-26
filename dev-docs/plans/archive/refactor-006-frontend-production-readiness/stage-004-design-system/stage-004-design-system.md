---
title: Design System Enforcement
slug: stage-004-design-system
stage_number: 4
status: complete
owner: engineering
plan: refactor-006-frontend-production-readiness
phases:
  - phase-001-token-compliance
  - phase-002-component-standardization
estimated_duration: 1d
risk_level: low
---

## Goal

Bring 100% of the UI into compliance with the Novellum design system by purging all hardcoded style values and migrating all ad-hoc button markup to the standardised primitive components.

## Phases

| # | Phase | Status | Est. Duration |
| --- | ----- | ------ | ------------- |
| 001 | [Token Compliance](./phase-001-token-compliance/phase-001-token-compliance.md) | `draft` | 0.5d |
| 002 | [Component Standardization](./phase-002-component-standardization/phase-002-component-standardization.md) | `draft` | 0.5d |

## Entry Criteria

- Stages 001–003 are `complete`.

## Exit Criteria

- All phases complete.
- `grep -rn ":[[:space:]]*[0-9]\+\(rem\|px\)" src/ --include="*.svelte"` returns zero results outside of the design token definition file.
- All button elements use `PrimaryButton`, `GhostButton`, or `DestructiveButton` primitives.

## Notes

Token values are defined in `src/styles/tokens.css`. Confirm the full token list before starting — do not invent new token names.
