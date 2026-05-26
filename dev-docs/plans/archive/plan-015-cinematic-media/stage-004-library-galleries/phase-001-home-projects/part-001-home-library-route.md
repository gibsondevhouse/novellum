---
title: Home Library Route
slug: part-001-home-library-route
part_number: 1
status: in-progress
owner: Stylist / Architect
assigned_to: Stylist / Architect
phase: phase-001-home-projects
estimated_duration: 1.5d
---

# Part-001: Home Library Route

## Objective

Refactor `/` into the cinematic home library with a continue-reading spotlight and media shelves.

## Scope

In scope: root route layout, hero, project rails, poster usage, empty/loading states, responsive behavior.

Out of scope: project persistence changes and reader feature expansion.

## Implementation Steps

1. Replace the route-specific hero banner with `SpotlightHero`.
2. Replace custom collection/list patterns with `MediaRail` and `EntityPoster`.
3. Add deterministic poster fallbacks for projects without covers.
4. Replace empty/loading states with `CinematicEmptyState` and matching skeleton geometry.
5. Validate mobile, desktop, and wide desktop layout.

## Files

Update:

- `src/routes/+page.svelte`
- `src/modules/project/components/CollectionRow.svelte`
- `src/modules/project/components/BookCoverCard.svelte` or wrappers as needed.

## Acceptance Criteria

- [ ] `/` has a strong first-viewport continue-reading focal point.
- [ ] Project collections are navigable by keyboard.
- [ ] Empty/loading states feel intentional.
- [ ] No undefined tokens or hardcoded visual values are introduced.

## Edge Cases

- No projects, one project, many projects, no cover art, long titles, and long synopses all render cleanly.
