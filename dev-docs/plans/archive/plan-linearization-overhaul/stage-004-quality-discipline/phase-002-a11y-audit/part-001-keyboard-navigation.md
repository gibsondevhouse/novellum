---
title: Keyboard Navigation & Focus
part_number: 1
status: complete
files_to_create: []
files_to_update:
  - src/lib/components/ui/PrimaryButton.svelte
  - src/lib/components/ui/SurfaceCard.svelte
estimated_duration: 1 day
acceptance_criteria_count: 2
edge_cases_count: 1
qa_sign_off: true
---

# Part 001: Keyboard Navigation & Focus

## Checklist
- [ ] Run automated a11y checks via testing library.
- [ ] Manually tab through the `Books` shelf and `Workspace`.
- [ ] Verify focus ring contrast ratios on both light and dark backgrounds.

## Acceptance Criteria
1. No a11y regressions in the linting pipeline.
2. Focus states are clearly visible and use the tokenized `--focus-ring`.

## Edge Cases
- Safari rendering of custom focus outlines.
