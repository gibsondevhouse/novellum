---
title: Library and Project Galleries
slug: stage-004-library-galleries
stage_number: 4
status: in-progress
owner: Stylist / Architect
plan: plan-015-cinematic-media
phases:
  - phase-001-home-projects
  - phase-002-books-stories
estimated_duration: 5d
risk_level: medium
---

# Stage-004: Library and Project Galleries

## Goal

Convert the top-level creative collections into production-ready cinematic media shelves. These are the first user-facing proof points for the new design language.

## Entry Criteria

- Stage 003 shell is stable.
- `SpotlightHero`, `EntityPoster`, `MediaRail`, and `CinematicEmptyState` are available.
- Seeded project data covers books, stories, projects with covers, and projects without covers.

## Phases

| # | Phase | Status | Owner | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Home and Project Library](phase-001-home-projects/phase-001-home-projects.md) | `in-progress` | Stylist / Architect | 3d |
| 002 | [Books and Stories Shelves](phase-002-books-stories/phase-002-books-stories.md) | `draft` | Stylist | 2d |

## Required Deliverables

- `/` uses a strong continue-reading spotlight, media rails, poster fallbacks, and polished empty/loading states.
- `/projects` presents books and stories as cohesive collections with creation actions and visual metadata.
- `/books` and `/stories` use dedicated shelf treatments rather than duplicated list layouts.
- Project/story/book posters reveal metadata without layout shift.

## Exit Criteria

- `/`, `/projects`, `/books`, and `/stories` pass visual review at mobile, tablet, desktop, and wide desktop.
- Empty and loading states match final geometry.
- Poster fallbacks render deterministically and do not appear broken.
- App-level visual baselines are updated only after reviewer approval.

## Notes

Do not optimize for only populated states. First-run empty states are part of the production release surface.
