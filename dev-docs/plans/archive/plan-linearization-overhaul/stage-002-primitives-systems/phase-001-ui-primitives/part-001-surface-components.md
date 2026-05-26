---
title: Surface Components
part_number: 1
status: complete
files_to_create:
  - src/lib/components/ui/SurfaceCard.svelte
  - src/lib/components/ui/SurfacePanel.svelte
files_to_update:
  - src/styles/tokens.css
estimated_duration: 1 day
acceptance_criteria_count: 3
edge_cases_count: 2
qa_sign_off: true
---

# Part 001: Surface Components

## Checklist
- [ ] Define `SurfaceCard` with Svelte 5 Runes.
- [ ] Implement `SurfacePanel` for route-level containers.
- [ ] Add `background-color` transitions using `--duration-fast`.
- [ ] Implement "tonal layering" CSS classes (e.g., `.surface-1`, `.surface-2`).

## Acceptance Criteria
1. `SurfaceCard` renders with tokenized padding `--space-4`.
2. Hover states use `--color-surface-hover`.
3. Focus states use `--color-focus-ring`.

## Edge Cases
- Overlapping box-shadows in dense grids.
- Contrast ratios in dark mode vs light mode.
