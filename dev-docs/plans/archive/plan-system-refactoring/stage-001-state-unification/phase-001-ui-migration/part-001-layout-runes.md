---
title: Migrate Layouts and Sidebar to Runes
part_number: '001'
status: draft
files_to_create: []
files_to_update:
  - src/routes/+layout.svelte
  - src/lib/components/AppSidebar.svelte
estimated_duration: 1 day
acceptance_criteria_count: 3
edge_cases_count: 1
qa_sign_off: false
---

# Part 001: Migrate Layouts and Sidebar to Runes

## Implementation Checklist

- [x] Refactor `src/routes/+layout.svelte` to use `$props()`.
- [x] Refactor `src/lib/components/AppSidebar.svelte` to use `$props()` and `$state()` for expanded/collapsed toggle state.
- [x] Ensure sidebar active item styling reacts correctly to SvelteKit `$page.url` store (use Svelte 5 `page` rune equivalent if applicable or keep standard store subscription).
- [x] Run `pnpm run check` to ensure no type errors.

## Acceptance Criteria
1. Application shell renders without console warnings about legacy props.
2. Sidebar expands and collapses, persisting state locally via `$state`.
3. Navigation between routes updates the active state in the sidebar immediately.

## Edge Cases
- Rapid clicking on sidebar toggles should not cause animation jank or state desync.
