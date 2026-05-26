---
title: Migrate Module Views to Runes
part_number: '002'
status: draft
files_to_create: []
files_to_update:
  - src/lib/components/ActiveProjectSection.svelte
  - src/lib/components/AiPanel.svelte
estimated_duration: 2 days
acceptance_criteria_count: 2
edge_cases_count: 0
qa_sign_off: false
---

# Part 002: Migrate Module Views to Runes

## Implementation Checklist

- [x] Refactor `ActiveProjectSection.svelte` to replace `export let` with `$props()`.
- [x] Refactor `AiPanel.svelte` to replace `export let` with `$props()` and manage AI loading states via `$state()`.
- [x] Validate component mounting and unmounting lifecycle.

## Acceptance Criteria
1. `AiPanel.svelte` correctly toggles visibility and loading states using runes.
2. `ActiveProjectSection.svelte` reflects the active project accurately.
