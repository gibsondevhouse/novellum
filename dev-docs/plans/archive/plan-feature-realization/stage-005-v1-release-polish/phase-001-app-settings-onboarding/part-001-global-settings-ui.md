---
title: Global Settings UI
part_number: 1
status: draft
files_to_create:
  - src/routes/settings/+page.svelte
  - src/modules/settings/components/ApiSettings.svelte
files_to_update:
  - src/lib/ai/openrouter.ts
estimated_duration: 1.5 days
acceptance_criteria_count: 2
edge_cases_count: 1
qa_sign_off: null
---

# Part 001: Global Settings UI

## Checklist
- [ ] Implement the `/settings` route.
- [ ] Build the `ApiSettings` component to manage API keys.
- [ ] Update `OpenRouterClient` to check for UI-provided keys before falling back to environment variables.

## Acceptance Criteria
1. API keys entered in the UI are persisted (e.g., to localStorage or a new settings table).
2. The AI features work correctly using the UI-provided key.

## Edge Cases
- Invalid API keys causing silent failures (need error feedback in settings).
