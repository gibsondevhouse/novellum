---
title: Refactor Global Stores
part_number: '001'
status: draft
files_to_create: []
files_to_update:
  - src/lib/stores/active-project.svelte.ts
  - src/lib/stores/ai-panel.svelte.ts
  - src/lib/stores/editor.svelte.ts
estimated_duration: 4 days
acceptance_criteria_count: 3
edge_cases_count: 1
qa_sign_off: false
---

# Part 001: Refactor Global Stores

## Implementation Checklist

- [x] Audit `active-project.svelte.ts`, `ai-panel.svelte.ts`, and `editor.svelte.ts`.
- [x] Ensure they export a Svelte 5 class instance with `$state` properties.
- [x] Remove any `writable` wrappers.
- [x] Update all consumer components to access properties directly (e.g., `activeProject.id` instead of `$activeProject.id`).

## Acceptance Criteria
1. Typescript passes across all store consumer files.
2. Reactivity works natively without `$` prefix store subscription syntax.
3. Editor state persists correctly across navigation events.

## Edge Cases
- Editor unsaved changes flag must reliably trigger reactive UI updates.
