---
title: Outline Storyboard
slug: part-001-outline-storyboard
part_number: 1
status: complete
owner: Architect / Stylist
assigned_to: Architect / Stylist
phase: phase-001-storyboard
estimated_duration: 2d
---

## Part-001: Outline Storyboard

## Objective

Refactor `/outline` into a storyboard/planning room while preserving hierarchy scan speed and editing efficiency.

## Scope

In scope: outline workspace layout, hierarchy navigator, empty state, act/chapter/scene detail panels, beat/storyboard visual language.

Out of scope: changing outline persistence or hierarchy data model.

## Implementation Steps

1. Apply cinematic shell to the outline workspace without adding nested cards.
2. Give acts, chapters, scenes, and beats visual frame language.
3. Preserve current selection, add, update, and navigation behavior.
4. Improve empty state and selected-item placeholder.
5. Validate dense stories and mobile behavior.

## Files

Update likely:

- `src/routes/projects/[id]/outline/+page.svelte`
- `src/modules/outliner/components/HierarchyNavigator.svelte`
- `src/modules/outliner/components/ActClarityPanel.svelte`
- `src/modules/outliner/components/ChapterClarityPanel.svelte`
- `src/modules/outliner/components/SceneClarityPanel.svelte`
- `src/modules/outliner/components/OutlineEmptyState.svelte`

## Acceptance Criteria

- [ ] Outline hierarchy remains fast to scan.
- [ ] Selected item detail panel is visually clear and productive.
- [ ] Mobile does not hide the only viable editing path.
- [ ] Dense outlines remain usable.

## Edge Cases

- Long act/chapter/scene names must not resize rows unpredictably.
