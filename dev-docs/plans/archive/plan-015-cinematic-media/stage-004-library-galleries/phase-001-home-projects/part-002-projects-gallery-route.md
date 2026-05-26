---
title: Projects Gallery Route
slug: part-002-projects-gallery-route
part_number: 2
status: in-progress
owner: Stylist / Architect
assigned_to: Stylist / Architect
phase: phase-001-home-projects
estimated_duration: 1.5d
---

# Part-002: Projects Gallery Route

## Objective

Refactor `/projects` into a media-forward projects gallery for books and stories.

## Scope

In scope: stories/books grouping, create actions, poster treatment, loading/empty states, responsive grid or rail behavior.

Out of scope: changing project creation data contracts.

## Implementation Steps

1. Introduce a route-level `SpotlightHero` or gallery header.
2. Render books and stories with shared `EntityPoster` treatment.
3. Keep creation flows available and visually aligned with shared primitives.
4. Replace `SurfacePanel`-wrapped list layouts where they create nested-card visuals.
5. Test empty stories, empty books, and mixed collections.

## Files

Update:

- `src/routes/projects/+page.svelte`
- Project create/card components only as needed for primitive integration.

## Acceptance Criteria

- [ ] Books and stories read as distinct collections under one coherent gallery.
- [ ] Create actions are visible and keyboard accessible.
- [ ] Cards reveal metadata without layout shift.
- [ ] Route passes responsive visual review.

## Edge Cases

- Independent empty states for stories and books must not duplicate large visual blocks awkwardly.
