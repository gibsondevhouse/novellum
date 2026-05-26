---
title: Books Shelf Refactor
phase_number: 1
status: draft
owner: engineering
parts:
  - part-001-books-layout
  - part-002-books-empty-states
estimated_duration: 2 days
acceptance_criteria_count: 3
edge_cases_count: 1
---

# Phase 001: Books Shelf Refactor

## Strategy
Migrate `/books` from a custom Svelte file to a composition of primitives.

## Acceptance Criteria
1. Header uses `SectionHeader` primitive.
2. Grid uses `SurfaceCard` (keeping `LibraryHeroCard` for the content).
3. "New Project" button uses `PrimaryButton` primitive.

## Edge Cases
- Handling long book titles in a dense card grid.
