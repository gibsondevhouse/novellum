---
title: Control Components
part_number: 2
status: complete
files_to_create:
  - src/lib/components/ui/SectionHeader.svelte
  - src/lib/components/ui/PrimaryButton.svelte
  - src/lib/components/ui/GhostButton.svelte
files_to_update: []
estimated_duration: 1 day
acceptance_criteria_count: 3
edge_cases_count: 1
qa_sign_off: true
---

# Part 002: Control Components

## Checklist
- [ ] Define `SectionHeader` supporting a title and a snippet for actions.
- [ ] Define `PrimaryButton` and `GhostButton` using Svelte 5 Runes.
- [ ] Ensure buttons use the established token CSS for hover, focus, and disabled states.

## Acceptance Criteria
1. `SectionHeader` renders a flex container with space-between for title and actions.
2. Buttons correctly pass through `onclick` and `disabled` attributes.
3. Interactive states respect motion tokens.

## Edge Cases
- Long titles in `SectionHeader` on mobile sizes.
