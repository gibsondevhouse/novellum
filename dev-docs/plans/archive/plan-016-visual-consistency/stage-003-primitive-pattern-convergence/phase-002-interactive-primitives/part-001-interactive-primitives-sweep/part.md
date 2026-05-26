---
title: Interactive Primitives Sweep
slug: part-001-interactive-primitives-sweep
part_number: 1
status: complete
owner: Stylist Agent
assigned_to: Stylist Agent
phase: phase-002-interactive-primitives
started_at: 2026-04-24 19:15 EDT
completed_at: 2026-04-25 22:12 EDT
estimated_duration: 1.5d
---

## Objective

Replace every local button, input, textarea, pill, and tab with canonical primitives.

## Scope

**In scope:**

- `PrimaryButton`, `SecondaryButton`, `GhostButton`, `DestructiveButton` migration.
- `Input` / textarea migration.
- `PillNav` and tab-like controls migration.

**Out of scope:**

- SectionHeader and metadata rows (in `phase-003-composite-patterns`).

## Implementation Steps

1. Migrate button usages from audit inventory.
2. Migrate input/textarea usages.
3. Migrate pill/tab usages.
4. Verify focus, hover, disabled, destructive treatments per canonical rules.
5. Run a11y sweep.

## Files

**Update:**

- `src/modules/outliner/components/AddChapterForm.svelte`
- `src/modules/outliner/components/AddSceneForm.svelte`
- `src/modules/outliner/components/OutlineEmptyState.svelte`
- `src/modules/outliner/components/BeatItem.svelte`
- `src/modules/assets/components/ImageGrid.svelte`
- `src/modules/settings/components/ThemeSelector.svelte`
- `src/modules/outliner/components/ArcTagHint.svelte`
- `src/modules/outliner/components/BeatList.svelte`
- `src/modules/project/components/DeleteProjectDialog.svelte`
- `src/modules/project/components/ProjectCreateCard.svelte`
- `src/modules/project/components/HubDetailsPanel.svelte`
- `src/modules/project/components/ProjectHeroContent.svelte`
- `src/modules/project/components/ProjectHeroSynopsis.svelte`
- `src/modules/project/components/ProjectCard.svelte`
- `src/modules/export/components/ExportModal.svelte`
- `src/modules/ai/components/SuggestionChips.svelte`
- `src/modules/project/components/ProjectAdvancedFields.svelte`
- `src/modules/project/components/ProjectStoryFields.svelte`
- `src/modules/project/components/ProjectHeroCover.svelte`
- `src/modules/project/components/ProjectCoreFields.svelte`
- `src/modules/ai/components/PromptInput.svelte`
- `src/modules/project/components/BookCoverCard.svelte`
- `src/modules/ai/components/ChatInterface.svelte`
- `src/modules/outliner/components/SceneClarityPanel.svelte`
- `src/modules/outliner/components/ChapterOutlinePanel.svelte`
- `src/modules/editor/components/VersionHistoryPanel.svelte`
- `src/modules/outliner/components/SceneRow.svelte`
- `src/modules/outliner/components/ChapterGroup.svelte`
- `src/modules/editor/components/ManuscriptSurface.svelte`
- `src/modules/outliner/components/ActPlanningPanel.svelte`
- `src/modules/outliner/components/ActClarityPanel.svelte`
- `src/modules/editor/components/EditModeToolbar.svelte`
- `src/modules/outliner/components/OutlineDetailCard.svelte`
- `src/modules/outliner/components/ActGroup.svelte`
- `src/modules/outliner/components/ChapterClarityPanel.svelte`
- `src/modules/outliner/components/beats/BeatOverlay.svelte`
- `src/modules/outliner/components/beats/BeatNumberField.svelte`
- `src/modules/consistency/components/IssueRow.svelte`
- `src/modules/continuity/components/PromptEditor.svelte`
- `src/modules/bible/components/RelationshipPanel.svelte`
- `src/modules/bible/components/FactionRelationshipPanel.svelte`
- `src/modules/bible/components/LineageRelationshipPanel.svelte`
- `src/modules/bible/components/NarrativeStatePanel.svelte`
- `src/modules/bible/components/FactionCoreIdentityPanel.svelte`
- `src/modules/bible/components/FactionCulturePanel.svelte`
- `src/modules/bible/components/FactionContinuityPanel.svelte`
- `src/modules/bible/components/VoicePanel.svelte`
- `src/modules/bible/components/CharacterCorePanel.svelte`
- `src/modules/bible/components/ContinuityPanel.svelte`
- `src/modules/bible/components/LineageCoreIdentityPanel.svelte`
- `src/modules/bible/components/LineageContinuityPanel.svelte`
- `src/modules/bible/components/LineageCurrentStatePanel.svelte`
- `src/modules/bible/components/LineageStoryFunctionPanel.svelte`
- `src/modules/bible/components/FactionCurrentStatePanel.svelte`
- `src/modules/bible/components/FactionStoryFunctionPanel.svelte`
- `src/modules/bible/components/FactionMembersPanel.svelte`
- `src/modules/bible/components/LineageMembersPanel.svelte`
- `src/modules/bible/components/StoryFunctionPanel.svelte`
- `src/modules/bible/components/LineageInheritanceCulturePanel.svelte`
- `src/modules/bible/components/LandmarkForm.svelte`
- `src/modules/bible/components/RealmForm.svelte`
- `src/modules/bible/components/IndividualsWorkspaceShell.svelte`
- `src/modules/bible/components/CharacterAssetLinker.svelte`
- `src/modules/bible/components/RelationshipEditor.svelte`
- `src/modules/bible/components/CharacterSelect.svelte`
- `src/modules/bible/components/IndividualsDossier.svelte`
- Additional targets staged in evidence inventory for subsequent batches.

## Acceptance Criteria

- [x] Zero local variants remain.
- [x] Focus / hover / disabled treatments identical.
- [x] Gates pass, a11y sweep passes.

## Edge Cases

- Custom buttons inside the editor toolbar may need ghost-button variant; capture decision in `impl.log.md`.

## Notes

- None.
