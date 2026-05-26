---
title: Stories Shelf Route
slug: part-002-stories-shelf-route
part_number: 2
status: draft
owner: Stylist
assigned_to: Stylist
phase: phase-002-books-stories
estimated_duration: 1d
---

# Part-002: Stories Shelf Route

## Objective

Refactor `/stories` into a polished short-form story shelf with compact media treatment.

## Scope

In scope: route header/spotlight, story posters, create story flow, empty/loading states.

Out of scope: changing story storage or project type semantics.

## Implementation Steps

1. Replace the custom route header and empty state with shared primitives.
2. Render stories with compact `EntityPoster` treatment.
3. Keep fast create-story flow accessible and visually consistent.
4. Ensure the layout works when story count is zero, one, or many.

## Files

Update:

- `src/routes/stories/+page.svelte`

## Acceptance Criteria

- [ ] `/stories` is visually aligned with `/books` while preserving short-form density.
- [ ] Create actions remain fast and obvious.
- [ ] Compact story posters do not clip text.

## Edge Cases

- Stories without genre/logline data must still render polished metadata fallbacks.
