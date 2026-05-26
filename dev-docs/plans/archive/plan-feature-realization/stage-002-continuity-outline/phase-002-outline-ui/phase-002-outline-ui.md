---
title: Outline UI
phase_number: 2
status: draft
owner: engineering
parts:
  - part-001-visual-outliner
estimated_duration: 4 days
acceptance_criteria_count: 2
edge_cases_count: 1
---

# Phase 002: Outline UI

## Strategy
Replace the `surface-stub` on the Outline route with the functional outliner components (likely already partially built in `src/modules/outliner`).

## Acceptance Criteria
1. The Outline route displays a hierarchy of Acts, Chapters, and Scenes.
2. Users can add new elements to the outline from this view.

## Edge Cases
- Performance issues with massive outlines (hundreds of scenes).
