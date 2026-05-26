---
title: Texture Tiers
part_number: 2
status: complete
files_to_create: []
files_to_update:
  - src/styles/components.css
estimated_duration: 1 day
acceptance_criteria_count: 2
edge_cases_count: 1
qa_sign_off: true
---

# Part 002: Texture Tiers

## Checklist
- [ ] Extract the "foil" and "gradient" logic from `LibraryHeroCard.svelte`.
- [ ] Create standardized texture utility classes (e.g., `.surface-texture-noise`, `.surface-texture-foil`).

## Acceptance Criteria
1. Texture classes are available globally.
2. They do not override the base tonal layer colors, but blend with them.

## Edge Cases
- Texture overlays breaking text contrast ratios.
