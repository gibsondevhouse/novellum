---
title: Pagination Engine
slug: stage-003-pagination-engine
stage_number: 3
status: draft
owner: Architect Agent
plan: plan-021-reader-pagination
phases:
  - phase-001-strategy-spike
  - phase-002-engine-implementation
  - phase-003-page-navigation-ui
  - phase-004-virtualization
  - phase-005-tests
estimated_duration: 2d
risk_level: medium
---

## Goal

Long-form prose splits into discrete fixed-size pages with no
clipped lines, no orphan paragraphs across the bottom edge, and
performant rendering on manuscripts of 100k+ words.

## Entry Criteria

- Stages 001 and 002 merged.
- Source HTML for prose is the saved scene/chapter content.

## Exit Criteria

- Strategy spike documented under `dev-docs/plans/plan-021-reader-pagination/research/strategy-spike.md`
  comparing CSS paged media vs. JS measurement, with chosen approach.
- Engine produces page array deterministically for a given content
  and page-box size.
- Previous / next page controls + visible page indicator working.
- Adjacent-page virtualization keeps DOM size flat regardless of
  manuscript length.
- Receives an optional target page id from the calling site and
  scrolls to it on mount (consumed by plan-023 editor "view in reader").
- Vitest unit tests cover the paging math; Playwright visual
  regression captures four page states.
