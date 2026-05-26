---
title: Application Shell & Design System
slug: stage-002-application-shell
stage_number: 2
status: complete
owner: Planner Agent
plan: plan-001-ui-and-interaction-model
phases:
  - phase-001-sveltekit-app-shell
  - phase-002-design-system-foundation
estimated_duration: 4d
risk_level: low
---

## Goal

Build the SvelteKit application shell — routing, layout, and sidebar navigation — and establish the design system token layer (CSS variables for color, typography, and spacing) that all module UIs will consume.

## Phases

| #   | Phase                                                                   | Status        | Est. Duration |
| --- | ----------------------------------------------------------------------- | ------------- | ------------- |
| 001 | [SvelteKit App Shell](phase-001-sveltekit-app-shell/phase.md)           | `in-progress` | 2d            |
| 002 | [Design System Foundation](phase-002-design-system-foundation/phase.md) | `draft`       | 2d            |

## Entry Criteria

- `stage-001-core-infrastructure` is `complete`
- All five module barrel exports are in place

## Exit Criteria

- All phases complete
- `pnpm run dev` renders the app shell with sidebar navigation
- Design system tokens applied globally; no hardcoded hex values in components
- All quality gates pass

## Notes

Design system source of truth: `dev-docs/design-system.md`. Dark editorial theme — Charcoal (`#1a1a1a`), Slate (`#0f0f0f`), Nova Blue (`#1e40af`), Teal (`#0ea5e9`).
