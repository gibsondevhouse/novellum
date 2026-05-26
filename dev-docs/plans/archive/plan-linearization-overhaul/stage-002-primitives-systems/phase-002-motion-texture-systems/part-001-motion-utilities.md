---
title: Motion Utilities
part_number: 1
status: complete
files_to_create: []
files_to_update:
  - src/styles/tokens.css
  - src/styles/components.css
estimated_duration: 1 day
acceptance_criteria_count: 2
edge_cases_count: 1
qa_sign_off: true
---

# Part 001: Motion Utilities

## Checklist
- [ ] Centralize `novellum-enter` keyframes in global CSS.
- [ ] Define `.motion-fade`, `.motion-slide`, and `.motion-lift` utility classes.
- [ ] Ensure all transitions use token durations (e.g., `--duration-fast`).

## Acceptance Criteria
1. Global motion utility classes are available.
2. `prefers-reduced-motion` suppresses these animations globally.

## Edge Cases
- Nested animations causing jarring staggered effects.
