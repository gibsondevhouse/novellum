---
title: App Shell Convergence
slug: stage-002-app-shell-convergence
stage_number: 2
status: complete
owner: Architect Agent
plan: plan-016-visual-consistency
phases:
  - phase-001-canonical-shell
  - phase-002-nav-and-header
  - phase-003-scroll-and-padding
estimated_duration: 4d
risk_level: medium
---

## Goal

Collapse the app's layout variants into one canonical shell — one background structure, one sidebar behavior, one page-header pattern, one scroll/padding contract — used by every route. Eliminate route-local shell re-implementations.

## Phases

| #   | Phase                                                                | Status        | Est. Duration |
| --- | -------------------------------------------------------------------- | ------------- | ------------- |
| 001 | [Canonical Shell Contract](phase-001-canonical-shell/phase.md)       | `complete`      | 1.5d          |
| 002 | [Navigation Rail & Page Header](phase-002-nav-and-header/phase.md)   | `complete`      | 1.5d          |
| 003 | [Scroll Boundaries & Padding](phase-003-scroll-and-padding/phase.md) | `complete`      | 1d            |

## Entry Criteria

- Stage 001 complete; canonical rules for the page shell, header, and scroll behavior are accepted.
- Surface Inventory lists every page that re-implements the shell.

## Exit Criteria

- One `AppShell` implementation backs every reachable route in `src/routes/**`.
- Sidebar, navigation rail, top-level page header, and scroll/padding behavior are driven by shared primitives.
- No route-local background, sidebar, or header CSS remains in module code (unless explicitly whitelisted and documented in canonical rules).
- Lint, typecheck, tokens, and boundaries gates pass.

## Notes

- Architect-led stage. Stylist reviews header and nav-rail treatments for visual polish.
- Changes here are structural; cosmetic changes belong to Stage 003.
