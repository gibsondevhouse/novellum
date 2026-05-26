---
title: Books Shelf Route
slug: part-001-books-shelf-route
part_number: 1
status: draft
owner: Stylist
assigned_to: Stylist
phase: phase-002-books-stories
estimated_duration: 1d
---

# Part-001: Books Shelf Route

## Objective

Refactor `/books` into a polished long-form manuscript shelf.

## Scope

In scope: route header/spotlight, poster shelf, create flow, skeletons, empty state.

Out of scope: changing project-open destination semantics unless existing behavior is broken.

## Implementation Steps

1. Replace route header with a cinematic spotlight or shelf header.
2. Use `EntityPoster` for books.
3. Align create project flow with `SideDrawer` or existing production form shell.
4. Replace list skeletons with poster skeletons.
5. Verify coverless and long-title states.

## Files

Update:

- `src/routes/books/+page.svelte`
- Relevant project card/create components if required.

## Acceptance Criteria

- [ ] `/books` has a clear shelf identity.
- [ ] Book posters are consistent with `/` and `/projects`.
- [ ] Empty and loading states are production-ready.

## Edge Cases

- A single book should not leave the page feeling empty; use layout constraints that still feel intentional.
