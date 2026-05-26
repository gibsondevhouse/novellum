---
title: Books and Stories Shelves
slug: phase-002-books-stories
phase_number: 2
status: draft
owner: Stylist
stage: stage-004-library-galleries
parts:
  - part-001-books-shelf-route
  - part-002-stories-shelf-route
estimated_duration: 2d
---

# Phase-002: Books and Stories Shelves

## Goal

Refactor `/books` and `/stories` into dedicated collection surfaces that share the cinematic gallery language without duplicating route-local UI patterns.

## Parts

| # | Part | Status | Assigned To | Est. Duration |
| --- | --- | --- | --- | --- |
| 001 | [Books Shelf Route](part-001-books-shelf-route.md) | `draft` | Stylist | 1d |
| 002 | [Stories Shelf Route](part-002-stories-shelf-route.md) | `draft` | Stylist | 1d |

## Implementation Strategy

Migrate both routes to `SpotlightHero`, `EntityPoster`, `MediaRail` or responsive poster grids, and `CinematicEmptyState`. Keep create flows accessible and visually consistent with `/projects`.

## Acceptance Criteria

- [ ] `/books` and `/stories` have route-specific focal points and collection layouts.
- [ ] Posters handle uploaded covers and deterministic fallback art.
- [ ] Loading skeletons match final poster/card geometry.
- [ ] Empty states provide direct create actions.

## Edge Cases

- Short story cards may need denser metadata than novel posters; use the same primitive with a compact aspect/tone rather than custom cards.
