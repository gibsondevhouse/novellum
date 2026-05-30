# Agent Prompt — Stage 002 Sidepanel UX

You are implementing Stage 002 of plan-030.

## Objective

Make the Nova sidepanel feel production-quality without expanding scope beyond Nova.

## Files

- `src/modules/nova/components/NovaPanel.svelte`
- `src/modules/nova/components/NovaComposer.svelte`
- `src/modules/nova/components/NovaMessageLog.svelte`
- `src/modules/nova/components/NovaErrorBoundary.svelte`
- `src/modules/nova/components/ContextDisclosurePill.svelte`
- `src/modules/nova/stores/nova-panel.svelte.ts`
- `src/modules/nova/stores/nova-session.svelte.ts`
- visual tests under `tests/visual/editor-nova-panel*.test.ts`

## Requirements

- Preserve resize, keyboard, and compact viewport behavior.
- Add clear Nova identity and status hierarchy.
- Make empty/no-project/project-attached/no-key/error/streaming/aborted states distinct.
- Ensure composer remains usable at constrained widths.
- Wire or disable attachment upload. Do not leave fake upload behavior.
- Replace user-facing “Copilot” labels with “Nova” unless intentionally retained.

## Tests

- desktop sidepanel visual
- constrained width visual
- compact viewport visual
- empty project-attached state
- no-project state
- no-key state
- attachment disabled/wired state

## Out of Scope

- full app shell redesign
- `/nova` route redesign unless explicitly selected
- new design system tokens unless existing tokens are insufficient
