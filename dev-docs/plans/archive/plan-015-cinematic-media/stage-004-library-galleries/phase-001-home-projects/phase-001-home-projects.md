---
title: Home and Project Library
slug: phase-001-home-projects
phase_number: 1
status: in-progress
owner: Stylist / Architect
stage: stage-004-library-galleries
parts:
  - part-001-home-library-route
  - part-002-projects-gallery-route
estimated_duration: 3d
---

# Phase-001: Home and Project Library

## Goal

Refactor `/` and `/projects` into the primary cinematic library experiences for returning authors and project selection.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Home Library Route](part-001-home-library-route.md) | `in-progress` | Stylist / Architect | 1.5d |
| 002 | [Projects Gallery Route](part-002-projects-gallery-route.md) | `in-progress` | Stylist / Architect | 1.5d |

## Implementation Strategy

Use `SpotlightHero`, `MediaRail`, `EntityPoster`, and `CinematicEmptyState`. Consolidate route-local list styling into shared poster/rail behavior and preserve create/open actions.

## Acceptance Criteria

- [ ] `/` provides a continue-reading spotlight and rail-based project discovery.
- [ ] `/projects` presents stories and books as media collections with clear create actions.
- [ ] Empty, loading, and coverless states look intentional.
- [ ] Both routes pass mobile and desktop visual review.

## Edge Cases

- With no projects, the first-run path must be obvious and visually polished.
- With many projects, rails/grids must remain performant and keyboard navigable.
