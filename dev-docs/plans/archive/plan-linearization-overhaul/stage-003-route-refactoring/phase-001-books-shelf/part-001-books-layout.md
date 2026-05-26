---
title: Books Layout Migration
part_number: 1
status: complete
files_to_create: []
files_to_update:
  - src/routes/books/+page.svelte
estimated_duration: 1 day
acceptance_criteria_count: 2
edge_cases_count: 1
qa_sign_off: true
---

# Part 001: Books Layout Migration

## Checklist
- [ ] Replace `div.header` with `<SectionHeader>`.
- [ ] Replace `button.new-project` with `<PrimaryButton>`.
- [ ] Wrap the project list in a `SurfacePanel`.
- [ ] Verify `novellum-enter` animation still works via the primitive.

## Acceptance Criteria
1. Visual parity with previous design but using 100% token-based CSS.
2. Improved responsiveness on tablet/mobile widths.

## Edge Cases
- Staggered animation timing for large libraries (> 50 projects).
