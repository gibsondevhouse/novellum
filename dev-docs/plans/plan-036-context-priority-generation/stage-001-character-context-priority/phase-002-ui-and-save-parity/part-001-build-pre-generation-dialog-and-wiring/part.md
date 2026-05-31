---
title: Build Pre-Generation Dialog and Wiring
slug: part-001-build-pre-generation-dialog-and-wiring
part_number: 1
status: review
owner: Planner Agent
assigned_to: Architect Agent
phase: phase-002-ui-and-save-parity
started_at: 2026-05-30
completed_at: 2026-05-30
estimated_duration: 0.75d
---

## Objective

Add a pre-generation dialog that surfaces candidate names extracted from title/synopsis and lets authors choose target/avoid intent before generation.

## Scope

**In scope:**

- New dialog component for context-priority controls.
- Candidate presentation with explicit intent toggles.
- Generate button flow update to open dialog and pass selected context.
- Character-first rollout (with extensibility hooks for factions/lineages).

**Out of scope:**

- Final faction/lineage UI behaviors (Stage 002).
- Modal review card redesign.

## Implementation Steps

1. Create `PreGenerationDialog.svelte` with intent controls and submit/cancel paths.
2. Add candidate extraction callsite and dialog open state management.
3. Update `GenerateButton` behavior to launch dialog for eligible entity kinds.
4. Wire dialog submission into `startGeneration(..., generationContext)`.
5. Ensure keyboard and escape handling match existing modal patterns.

## Files

**Create:**

- `src/modules/world-building/components/PreGenerationDialog.svelte`

**Update:**

- `src/modules/world-building/components/GenerateButton.svelte`
- `src/modules/world-building/components/WorldBuildingWorkspacePage.svelte`
- `src/modules/world-building/index.ts`

## Acceptance Criteria

- [x] Dialog appears before generation for character workflows
- [x] User can set intent for extracted names and continue/cancel safely
- [x] Generation still works when user skips all selections
- [x] No regression to existing busy/disabled generate behavior

## Edge Cases

- Empty extraction result should show a usable fallback message and still allow generation.

## Notes

Use existing tokenized modal styling patterns already present in world-building surfaces.
