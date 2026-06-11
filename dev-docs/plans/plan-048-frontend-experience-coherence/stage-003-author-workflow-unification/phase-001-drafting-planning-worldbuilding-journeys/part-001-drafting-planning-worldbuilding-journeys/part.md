---
title: Drafting, Planning & Worldbuilding Journeys
slug: part-001-drafting-planning-worldbuilding-journeys
part_number: 1
status: draft
owner: Planner Agent
assigned_to: unassigned
phase: phase-001-drafting-planning-worldbuilding-journeys
started_at: ~
completed_at: ~
estimated_duration: TBD
---

## Objective

Unify the primary author workflow surfaces so planning, drafting, and world-building hand off cleanly.

## Scope

**In scope:**

- Align project hub next actions with editor, outline, world-building, continuity, and export workflows.
- Standardize empty states and incomplete states for authoring surfaces.
- Ensure world-building and outline outputs have visible paths into drafting without silent mutation.

**Out of scope:**

- Adding new world-building taxonomies.
- Rewriting editor persistence or outline hierarchy behavior.

## Implementation Steps

1. Compare the workflow map against project hub, editor, outline, and world-building surfaces.
2. Identify and fix inconsistent primary actions, empty states, status labels, and handoff points.
3. Update focused component tests for changed states.
4. Add targeted e2e coverage for a representative project-to-draft flow.
5. Save journey evidence under this part.

## Files

**Create:**

- `evidence/drafting-planning-worldbuilding-journeys-2026-06-09.md`

**Update:**

- `src/routes/projects/[id]/+page.svelte`
- `src/routes/projects/[id]/editor/+page.svelte`
- `src/routes/projects/[id]/outline/+page.svelte`
- `src/routes/projects/[id]/world-building/+page.svelte`
- `src/modules/editor/components/EditorShell.svelte`
- `src/modules/editor/components/SceneNavigator.svelte`
- `src/modules/outline/components`
- `src/modules/world-building/components/WorldBuildingWorkspacePage.svelte`
- `src/modules/world-building/components/WorldBuildingWorkspaceEmptyState.svelte`
- `tests/e2e/project-lifecycle.spec.ts`
- `tests/e2e/outline-generation-review.spec.ts`
- `tests/e2e/vibe-worldbuild-checkpoints.spec.ts`

**Reference:**

- `tests/project/hub-status-cards.test.ts`
- `tests/editor/editor-toolbar.test.ts`
- `tests/outline/outline-page-structure.test.ts`
- `tests/outline/worldbuild-checkpoint-decision-flow.test.ts`

## Acceptance Criteria

- [ ] Editor, outline, and world-building surfaces expose consistent next actions.
- [ ] Empty and incomplete states guide authors toward useful work without feature narration.
- [ ] Project hub, editor, outline, and worldbuilding e2e paths remain intact.

## Edge Cases

- New projects may have no characters, no outline, and no manuscript scenes yet.
- Existing projects may have manuscript content but missing world-building or outline data.

## Notes

Keep actions concrete and author-centered. Avoid turning empty states into explanatory docs.
