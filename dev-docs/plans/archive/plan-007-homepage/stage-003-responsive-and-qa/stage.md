---
title: Responsive Layout and QA
slug: stage-003-responsive-and-qa
stage_number: 3
status: draft
owner: Frontend Agent
plan: plan-007-homepage
phases:
  - phase-001-responsive-grid
  - phase-002-visual-qa
estimated_duration: 1d
risk_level: low
---

## Goal

Validate and harden responsive grid behaviour across four target viewports, collect visual evidence, and sign off the homepage as production-ready.

## Phases

| # | Phase | Status | Est. Duration |
| --- | --- | --- | --- |
| 001 | [Responsive Grid](phase-001-responsive-grid/phase.md) | `draft` | 0.5d |
| 002 | [Visual QA](phase-002-visual-qa/phase.md) | `draft` | 0.5d |

## Entry Criteria

- Stages 001 and 002 (`editorial-page-shell`, `project-card-visual-system`) are both `complete`
- Local dev server is running at `http://localhost:5173/`

## Exit Criteria

- Grid renders correctly at all four target viewports (1440px, 1024px, 768px, 375px)
- Screenshots at all four viewports stored in `evidence/`
- Empty state and loading skeleton also confirmed at all breakpoints
- All quality gates pass: lint, typecheck, visual review

## Notes

- This stage is the acceptance gate for the full plan. Do not mark `plan-007-homepage` as `complete` until this stage is signed off.
