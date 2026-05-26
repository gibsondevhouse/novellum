---
title: Editor Drafting Studio
slug: part-002-editor-drafting-studio
part_number: 2
status: complete
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-001-storyboard
estimated_duration: 3d
---

## Part-002: Editor Drafting Studio

## Objective

Refactor `/editor` and `/editor/[sceneId]` into a focused drafting studio with cinematic support surfaces and no loss of writing efficiency.

## Scope

In scope: scene navigator, editor toolbar, manuscript canvas, story compass, progress footer, AI actions, AI panel integration, focus-mode policy.

Out of scope: replacing the editor engine or autosave service.

## Implementation Steps

1. Refactor editor layout to reduce visual noise around the manuscript.
2. Preserve scene context, autosave status, word count, and scene navigation.
3. Convert AI action cluster to a clear command surface.
4. Polish story compass as a contextual panel that can collapse without losing critical state.
5. Define focus-mode behavior and reduced-motion behavior.
6. Validate no-scene, one-scene, many-scene, long-scene, and AI-open states.

## Files

Update likely:

- `src/routes/projects/[id]/editor/+page.svelte`
- `src/routes/projects/[id]/editor/[sceneId]/+page.svelte`
- `src/lib/components/AiPanel.svelte`
- Editor module components as needed.

## Acceptance Criteria

- [ ] Manuscript area is calm, readable, and primary.
- [ ] Save status and scene context remain visible or recoverable.
- [ ] AI tools are accessible without dominating drafting.
- [ ] Focus mode does not create keyboard traps or hidden controls.

## Edge Cases

- When AI panel is open, the editor must not compress below usable width without a responsive fallback.
