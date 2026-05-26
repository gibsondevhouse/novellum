---
title: Workspace Layout
part_number: 1
status: complete
files_to_create: []
files_to_update:
  - src/routes/projects/[id]/+layout.svelte
  - src/routes/projects/[id]/editor/+page.svelte
estimated_duration: 3 days
acceptance_criteria_count: 3
edge_cases_count: 2
qa_sign_off: true
---

# Part 001: Workspace Layout

## Checklist
- [ ] Refactor `projects/[id]/+layout.svelte` to use `SurfacePanel` and `SectionHeader`.
- [ ] Standardize the mode switcher component to match Linear tab styles.
- [ ] Refactor the Editor toolbars to use `GhostButton` or `IconButton` primitives.

## Acceptance Criteria
1. The entire workspace uses consistent tonal layering without stark white borders.
2. Modals within the workspace (e.g., rewriting options) use `SurfaceCard` with elevated styles.

## Edge Cases
- Interaction with the AI Sidebar pane layout.
- Managing vertical height for the rich text editor pane.
