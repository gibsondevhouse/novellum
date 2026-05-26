---
title: Layout Primitives
phase_number: 1
status: draft
owner: engineering
parts:
  - part-001-surface-components
  - part-002-control-components
estimated_duration: 3 days
acceptance_criteria_count: 4
edge_cases_count: 3
---

# Phase 001: Layout Primitives

## Strategy
Create high-density, high-quality primitives that use tonal layering instead of borders.

## Acceptance Criteria
1. `SurfaceCard.svelte` supports `elevated`, `flat`, and `inset` variants.
2. `SectionHeader.svelte` supports actions (buttons) and metadata slots.
3. All components use `$props()` for type safety.
4. Components respect `prefers-reduced-motion`.

## Edge Cases
- Nested surfaces (Surface within a Surface).
- Dynamic content heights causing layout shifts.
- Mobile vs Desktop padding transitions.
