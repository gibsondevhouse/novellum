---
title: Visual Outliner Integration
part_number: 1
status: draft
files_to_create: []
files_to_update:
  - src/routes/projects/[id]/outline/+page.svelte
estimated_duration: 4 days
acceptance_criteria_count: 2
edge_cases_count: 1
qa_sign_off: null
---

# Part 001: Visual Outliner Integration

## Checklist
- [ ] Import and assemble the outliner components from `src/modules/outliner`.
- [ ] Remove the `surface-stub` from the route.
- [ ] Ensure drag-and-drop or reordering logic is fully functional.

## Acceptance Criteria
1. The outline is fully visible and interactive.
2. Changes to the outline reflect in the database.

## Edge Cases
- Dragging a scene between chapters updates its parent ID correctly.
