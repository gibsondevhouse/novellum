---
title: Linting & Boundary Rules
part_number: 1
status: complete
files_to_create: []
files_to_update:
  - .prettierrc
  - eslint.config.js
estimated_duration: 4 hours
acceptance_criteria_count: 2
edge_cases_count: 1
qa_sign_off: true
---

# Part 001: Linting & Boundary Rules

## Checklist
- [ ] Add rules to `eslint.config.js` to enforce primitive usage.
- [ ] Update `GEMINI.md` with "Linearization" standards.
- [ ] Create a `dev-docs/checklists/ui-review.md` for manual sign-offs.

## Acceptance Criteria
1. CI fails if a new component uses hardcoded colors instead of tokens.
2. Module boundaries prevent route-level CSS from overriding primitive internals.

## Edge Cases
- Legacy files that haven't been refactored yet (need exclusion list).
