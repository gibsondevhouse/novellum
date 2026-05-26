---
title: Nova, Images, Settings, and Styles
slug: part-003-nova-images-settings-styles
part_number: 3
status: complete
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-001-storyboard
estimated_duration: 3d
---

## Part-003: Nova, Images, Settings, and Styles

## Objective

Bring secondary but visible workflow surfaces up to the same production UI standard as the main creative routes.

## Scope

In scope: `/nova`, `/images`, `/settings`, `/settings/migrate`, `/styles`, chat empty/conversation states, asset modal/drawer, configuration tabs/forms.

Out of scope: changing AI provider behavior, upload storage policy, or settings persistence contracts.

## Implementation Steps

1. Refactor Nova empty prompt stage and conversation mode with cinematic shell alignment.
2. Refactor image albums into media shelves/grids with polished inspection and assignment flows.
3. Refactor settings and migration surfaces into production configuration panels.
4. Refactor styles/prompts/instructions into curated preset/custom collections with shared drawer/form treatment.
5. Validate loading, empty, error, disabled, destructive, and long-content states.

## Files

Update likely:

- `src/routes/nova/+page.svelte`
- `src/modules/ai/components/ChatInterface.svelte`
- `src/modules/ai/components/PromptInput.svelte`
- `src/modules/ai/components/SuggestionChips.svelte`
- `src/modules/ai/components/QuickLinks.svelte`
- `src/routes/images/+page.svelte`
- `src/modules/assets/components/ImageGrid.svelte`
- `src/routes/settings/+page.svelte`
- `src/routes/settings/migrate/+page.svelte`
- `src/routes/styles/+page.svelte`
- Settings module components as needed.

## Acceptance Criteria

- [ ] Nova has polished empty, streaming, error, and conversation states.
- [ ] Images gallery supports inspection, assignment, deletion, and metadata without rough dialogs.
- [ ] Settings and Styles use shared configuration UI patterns.
- [ ] All routes pass responsive and keyboard review.

## Edge Cases

- Large uploaded images must not overflow modals or cause layout shift.
