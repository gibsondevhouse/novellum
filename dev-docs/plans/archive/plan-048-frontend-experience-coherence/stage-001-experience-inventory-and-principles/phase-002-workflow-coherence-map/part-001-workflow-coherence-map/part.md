---
title: Workflow Coherence Map
slug: part-001-workflow-coherence-map
part_number: 1
status: complete
owner: Planner Agent
assigned_to: Codex
phase: phase-002-workflow-coherence-map
started_at: 2026-06-15T00:00:00-04:00
completed_at: 2026-06-15T00:00:00-04:00
estimated_duration: 1h
---

## Objective

Write the target author workflow map that the frontend coherence pass will optimize for.

## Scope

**In scope:**

- Map workflows for starting a project, building canon, outlining, drafting, revising, accepting AI suggestions, exporting, and recovering from errors.
- Identify where Nova should appear as contextual assistance versus a global chat surface.
- Define frontend principles for review gates, context visibility, status feedback, and progressive disclosure.

**Out of scope:**

- Writing implementation code.
- Introducing new AI tools or new persistence contracts.

## Implementation Steps

1. Convert the route inventory into primary author journeys.
2. For each journey, document entry point, active context, expected Nova behavior, review gate, failure state, and success state.
3. Identify workflow seams that must be resolved by stages 002 and 003.
4. Save the workflow map as dated evidence under this part.

## Files

**Create:**

- `evidence/workflow-coherence-map-2026-06-15.md`

**Update:**

- None

**Reference:**

- `src/routes/projects/[id]/+page.svelte`
- `src/routes/projects/[id]/editor/+page.svelte`
- `src/routes/projects/[id]/outline/+page.svelte`
- `src/routes/projects/[id]/world-building/+page.svelte`
- `src/routes/nova/+page.svelte`
- `src/modules/nova/stores/nova-panel.svelte.ts`
- `src/modules/world-building/components/WorldBuildingWorkspacePage.svelte`
- `src/modules/editor/components/EditorShell.svelte`
- `src/modules/export/components/ManuscriptExportDialog.svelte`
- `novellum-docs/user/nova.md`

## Acceptance Criteria

- [x] Primary author journeys are mapped from entry to completion.
- [x] Each journey identifies required context, review gates, and completion signals.
- [x] Frontend principles are written as constraints for later stages.

## Edge Cases

- Empty projects need useful next actions without sending authors into dead ends.
- Global Nova routes may have less context than project-scoped Nova surfaces.

## Evidence

- [Workflow Coherence Map (2026-06-15)](./evidence/workflow-coherence-map-2026-06-15.md)

## Notes

The map should become the contract for evaluating whether later UI changes actually improve the app.
