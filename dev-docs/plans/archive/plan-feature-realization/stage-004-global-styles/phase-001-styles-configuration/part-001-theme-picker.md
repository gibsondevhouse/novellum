---
title: Theme Picker
part_number: 1
status: draft
files_to_create:
  - src/modules/settings/components/ThemeSelector.svelte
files_to_update:
  - src/routes/styles/+page.svelte
estimated_duration: 3 days
acceptance_criteria_count: 2
edge_cases_count: 0
qa_sign_off: null
---

# Part 001: Theme Picker

## Checklist
- [ ] Build a `ThemeSelector` using `SurfaceCard`.
- [ ] Store user preferences in localStorage or a global settings table.
- [ ] Apply the selected theme dynamically by modifying `document.documentElement` data attributes.

## Acceptance Criteria
1. Changing the theme instantly updates the app's visual appearance.
2. The choice persists across page reloads.

## Edge Cases
- None.
