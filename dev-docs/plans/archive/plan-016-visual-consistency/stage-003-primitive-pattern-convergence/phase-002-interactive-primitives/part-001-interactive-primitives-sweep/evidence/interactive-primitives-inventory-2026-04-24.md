# Interactive Primitives Inventory (2026-04-24)

## Purpose

Initial target inventory for Phase 002 (`part-001-interactive-primitives-sweep`) to replace local button/input/textarea/pill/tab variants with canonical primitives.

## Discovery Commands

```text
grep_search: <button class=... in src/modules/**/*.svelte
grep_search: <input ... class=... in src/modules/**/*.svelte
grep_search: <textarea ... class=... in src/modules/**/*.svelte
grep_search: class="...tab|pill..." in src/modules/**/*.svelte
```

## High-Level Counts

- Local button-class usages in module components: 44 matches
- Input class usages in module components: 103 matches
- Textarea class usages in module components: 154 matches
- Tab/pill class usages in module components: 13 matches

## Candidate Clusters

1. Outliner additive controls and beat actions
2. Bible inline editors (`input-inline`, archive form controls)
3. Assets modal actions (`btn-primary`, `btn-ghost`, `btn-danger`)
4. Export format tab controls (`format-tab`)
5. AI quick-link pills and outliner arc pills (evaluate whether decorative vs interactive primitive scope)

## Batch 1 Implemented

- `src/modules/outliner/components/AddChapterForm.svelte`
- `src/modules/outliner/components/AddSceneForm.svelte`

Changes in batch 1:

- Replaced local submit/cancel/toggle buttons with `PrimaryButton` and `GhostButton` from `$lib/components/ui/index.js`.
- Preserved Enter/Escape keyboard handling and focus behavior.
- Kept local layout styles while removing local visual button re-implementations where redundant.

## Batch 2 Implemented

- `src/modules/outliner/components/OutlineEmptyState.svelte`
- `src/modules/outliner/components/BeatItem.svelte`

Changes in batch 2:

- Replaced local CTA and utility buttons with canonical button primitives from `$lib/components/ui/index.js`.
- Preserved existing interactions and semantics:
  - `OutlineEmptyState`: CTA action retained (`onAddFirstAct`).
  - `BeatItem`: select behavior retained and delete confirmation flow unchanged.
- Updated wrapper-dependent selectors to `:global(...)` where needed to maintain styling across primitive component boundaries.

Validation snapshot (batch 2):

- `pnpm exec eslint src/modules/outliner/components/OutlineEmptyState.svelte src/modules/outliner/components/BeatItem.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 3 Implemented

- `src/modules/assets/components/ImageGrid.svelte`

Changes in batch 3:

- Replaced local dialog/action button variants with canonical primitives:
  - `btn-primary` -> `PrimaryButton`
  - `btn-ghost` -> `GhostButton`
  - `btn-danger` -> `DestructiveButton`
  - `close-btn` wrapper migrated to `GhostButton` with preserved class styling
- Kept existing behaviors intact:
  - asset preview close action
  - delete confirmation branch
  - assignment confirmation and cancel toggles

Validation snapshot (batch 3):

- `pnpm exec eslint src/modules/assets/components/ImageGrid.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 4 Implemented

- `src/modules/outliner/components/ArcTagHint.svelte`
- `src/modules/outliner/components/BeatList.svelte`

Changes in batch 4:

- Replaced local add/hint button variants with canonical `GhostButton`.
- Preserved current control semantics and keyboard behavior (`type="button"`, existing handlers unchanged).
- Applied `:global(...)` selector scoping for class-based style hooks used on primitive-wrapped controls.

Validation snapshot (batch 4):

- `pnpm exec eslint src/modules/outliner/components/ArcTagHint.svelte src/modules/outliner/components/BeatList.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 5 Implemented

- `src/modules/project/components/DeleteProjectDialog.svelte`

Changes in batch 5:

- Replaced local `.btn-danger` button with canonical `DestructiveButton`.
- Preserved dialog semantics and behavior: cancel action, async delete action, and deleting disabled state.

Validation snapshot (batch 5):

- `pnpm exec eslint src/modules/project/components/DeleteProjectDialog.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 6 Implemented

- `src/modules/project/components/ProjectCreateCard.svelte`

Changes in batch 6:

- Replaced local modal header close button with canonical `GhostButton`.
- Replaced local advanced disclosure toggle button with canonical `GhostButton` while preserving disclosure behavior.
- Updated style selectors with `:global(...)` where class hooks needed to apply across primitive wrappers.

Validation snapshot (batch 6):

- `pnpm exec eslint src/modules/project/components/ProjectCreateCard.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 7 Implemented

- `src/modules/project/components/HubDetailsPanel.svelte`

Changes in batch 7:

- Replaced local target-edit action button (`details-val-btn`) with canonical `GhostButton`.
- Preserved existing update flow and disclosure behavior around target editing.
- Converted selector targeting to `:global(...)` so class-based style hooks continue to apply through primitive wrappers.

Validation snapshot (batch 7):

- `pnpm exec eslint src/modules/project/components/HubDetailsPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 8 Implemented

- `src/modules/project/components/ProjectHeroContent.svelte`
- `src/modules/project/components/ProjectHeroSynopsis.svelte`

Changes in batch 8:

- Replaced local inline-edit action and empty-state button variants with canonical `GhostButton` primitives.
- Preserved edit/confirm/cancel behavior and keyboard handling paths tied to the active inline inputs.
- Updated selector scoping to `:global(...)` for class-based hooks that must cross primitive wrapper boundaries.

Validation snapshot (batch 8):

- `pnpm exec eslint src/modules/project/components/ProjectHeroContent.svelte src/modules/project/components/ProjectHeroSynopsis.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 9 Implemented

- `src/modules/project/components/ProjectCard.svelte`

Changes in batch 9:

- Replaced local project-card action button (`card-btn`) with canonical `GhostButton`.
- Preserved card selection behavior and visual layout while converting class styling hooks to `:global(...)` targeting.

Validation snapshot (batch 9):

- `pnpm exec eslint src/modules/project/components/ProjectHeroContent.svelte src/modules/project/components/ProjectHeroSynopsis.svelte src/modules/project/components/ProjectCard.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 10 Implemented

- `src/modules/export/components/ExportModal.svelte`
- `src/modules/ai/components/SuggestionChips.svelte`

Changes in batch 10:

- Replaced local format-tab and suggestion-chip button variants with canonical `GhostButton` primitives.
- Preserved existing control semantics and callbacks:
  - export format selection remains ARIA radio-pattern based (`radiogroup` + `role="radio"`).
  - suggestion chip click handlers continue invoking `onselect(prompt)`.
- Updated class-hook selectors to `:global(...)` for primitive wrapper compatibility.

Validation snapshot (batch 10):

- `pnpm exec eslint src/modules/export/components/ExportModal.svelte src/modules/ai/components/SuggestionChips.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 11 Implemented

- `src/modules/project/components/ProjectCreateCard.svelte`

Changes in batch 11:

- Replaced the backdrop dismiss element from a hidden local `<button>` to a presentation backdrop layer to avoid local button variant debt in the modal shell.
- Preserved click-to-dismiss behavior and retained existing canonical button primitives for explicit actions.

Validation snapshot (batch 11):

- `pnpm exec eslint src/modules/project/components/ProjectCreateCard.svelte src/modules/export/components/ExportModal.svelte src/modules/ai/components/SuggestionChips.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 12 Implemented

- `src/modules/project/components/ProjectAdvancedFields.svelte`
- `src/modules/project/components/ProjectStoryFields.svelte`

Changes in batch 12:

- Replaced local preset/disclosure button variants with canonical `GhostButton` primitives.
- Preserved accessibility and control semantics (`aria-pressed`, `aria-expanded`, `aria-controls`) and existing toggle/select handlers.
- Updated class-hook selectors to `:global(...)` for primitive wrapper compatibility.

Validation snapshot (batch 12):

- `pnpm exec eslint src/modules/project/components/ProjectAdvancedFields.svelte src/modules/project/components/ProjectStoryFields.svelte src/modules/project/components/ProjectCreateCard.svelte src/modules/export/components/ExportModal.svelte src/modules/ai/components/SuggestionChips.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 13 Implemented

- `src/modules/project/components/ProjectHeroCover.svelte`
- `src/modules/project/components/ProjectCoreFields.svelte`
- `src/modules/ai/components/PromptInput.svelte`

Changes in batch 13:

- Replaced local cover action, tag-remove, context-menu/action, and send controls with canonical `GhostButton` primitives.
- Preserved existing interaction and accessibility behavior, including context-item removal, context-menu actions, file picker trigger, and message submit trigger.
- Updated class selectors to `:global(...)` where component class hooks must apply through primitive wrappers.

Validation snapshot (batch 13):

- `pnpm exec eslint src/modules/project/components/ProjectHeroCover.svelte src/modules/project/components/ProjectCoreFields.svelte src/modules/ai/components/PromptInput.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 14 Implemented

- `src/modules/project/components/BookCoverCard.svelte`
- `src/modules/ai/components/ChatInterface.svelte`

Changes in batch 14:

- Replaced project/ai module local picker/card action buttons with canonical `GhostButton` primitives.
- Preserved existing interaction behavior:
  - `BookCoverCard`: open reader action unchanged.
  - `ChatInterface`: project-picker close/toggle/done flows unchanged.
- Updated selector targeting to `:global(...)` and replaced class-directive usage on component instances with explicit class strings.

Validation snapshot (batch 14):

- `pnpm exec eslint src/modules/project/components/BookCoverCard.svelte src/modules/ai/components/ChatInterface.svelte src/modules/ai/components/PromptInput.svelte src/modules/project/components/ProjectHeroCover.svelte src/modules/project/components/ProjectCoreFields.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 15 Implemented

- `src/modules/outliner/components/SceneClarityPanel.svelte`
- `src/modules/outliner/components/ChapterOutlinePanel.svelte`
- `src/modules/editor/components/VersionHistoryPanel.svelte`

Changes in batch 15:

- Replaced local outliner/editor beat/list utility controls with canonical `GhostButton` primitives.
- Preserved behavior for beat move/add/remove flows, beat focus open actions, and version history close/select/restore controls.
- Updated wrapper-targeted class selectors to `:global(...)` and used explicit class strings where component directive constraints apply.

Validation snapshot (batch 15):

- `pnpm exec eslint src/modules/outliner/components/SceneClarityPanel.svelte src/modules/outliner/components/ChapterOutlinePanel.svelte src/modules/editor/components/VersionHistoryPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 16 Implemented

- `src/modules/outliner/components/SceneRow.svelte`
- `src/modules/outliner/components/ChapterGroup.svelte`
- `src/modules/editor/components/ManuscriptSurface.svelte`

Changes in batch 16:

- Replaced local outliner row utility controls and manuscript bubble menu controls with canonical `GhostButton` primitives.
- Preserved existing interactions:
  - `SceneRow` and `ChapterGroup`: select, rename, delete, and expand/collapse flows.
  - `ManuscriptSurface`: formatting command toggles and active-state visual feedback.
- Updated wrapper-targeted selectors to `:global(...)` and converted component-level class directive usage to explicit class strings where required.

Validation snapshot (batch 16):

- `pnpm exec eslint src/modules/outliner/components/SceneRow.svelte src/modules/outliner/components/ChapterGroup.svelte src/modules/editor/components/ManuscriptSurface.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 17 Implemented

- `src/modules/outliner/components/ActPlanningPanel.svelte`
- `src/modules/outliner/components/ActClarityPanel.svelte`
- `src/modules/editor/components/EditModeToolbar.svelte`

Changes in batch 17:

- Replaced local outliner/editor control buttons with canonical `GhostButton` primitives.
- Preserved existing behavior:
  - `ActPlanningPanel`: title edit trigger and delete action.
  - `ActClarityPanel`: act title edit trigger and chapter row disclosure toggle.
  - `EditModeToolbar`: mode selection and active-state semantics.
- Updated wrapper-bound class selectors to `:global(...)` and used explicit class strings where component directives are not valid.

Validation snapshot (batch 17):

- `pnpm exec eslint src/modules/outliner/components/ActPlanningPanel.svelte src/modules/outliner/components/ActClarityPanel.svelte src/modules/editor/components/EditModeToolbar.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 18 Implemented

- `src/modules/outliner/components/OutlineDetailCard.svelte`
- `src/modules/outliner/components/ActGroup.svelte`
- `src/modules/outliner/components/ChapterClarityPanel.svelte`

Changes in batch 18:

- Replaced queued outliner local controls with canonical `GhostButton` primitives.
- Preserved interactions for planning panel close controls, act disclosure/select controls, and chapter scene-add control.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 18):

- `pnpm exec eslint src/modules/outliner/components/OutlineDetailCard.svelte src/modules/outliner/components/ActGroup.svelte src/modules/outliner/components/ChapterClarityPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 19 Implemented

- `src/modules/outliner/components/beats/BeatOverlay.svelte`
- `src/modules/outliner/components/beats/BeatNumberField.svelte`

Changes in batch 19:

- Replaced the final residual outliner/editor local beat control buttons with canonical `GhostButton` primitives.
- Preserved save/delete behavior and associated keyboard/blur interaction flows.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 19):

- `pnpm exec eslint src/modules/outliner/components/beats/BeatOverlay.svelte src/modules/outliner/components/beats/BeatNumberField.svelte src/modules/outliner/components/OutlineDetailCard.svelte src/modules/outliner/components/ActGroup.svelte src/modules/outliner/components/ChapterClarityPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 20 Implemented

- `src/modules/consistency/components/IssueRow.svelte`
- `src/modules/continuity/components/PromptEditor.svelte`

Changes in batch 20:

- Replaced consistency action buttons with canonical `GhostButton` primitives.
- Replaced continuity prompt save control with canonical `PrimaryButton` primitive.
- Preserved existing action behavior and disabled/save interaction semantics.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 20):

- `pnpm exec eslint src/modules/consistency/components/IssueRow.svelte src/modules/continuity/components/PromptEditor.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 21 Implemented

- `src/modules/bible/components/RelationshipPanel.svelte`
- `src/modules/bible/components/FactionRelationshipPanel.svelte`

Changes in batch 21:

- Replaced relationship panel local controls with canonical `GhostButton` primitives.
- Preserved collapse/create/save/cancel/remove control semantics and existing form behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 21):

- `pnpm exec eslint src/modules/bible/components/RelationshipPanel.svelte src/modules/bible/components/FactionRelationshipPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 22 Implemented

- `src/modules/bible/components/LineageRelationshipPanel.svelte`
- `src/modules/bible/components/NarrativeStatePanel.svelte`

Changes in batch 22:

- Replaced lineage relationship and narrative-state local controls with canonical `GhostButton` primitives.
- Preserved collapse/create/save/cancel/remove control semantics and existing field-edit behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 22):

- `pnpm exec eslint src/modules/bible/components/LineageRelationshipPanel.svelte src/modules/bible/components/NarrativeStatePanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 23 Implemented

- `src/modules/bible/components/FactionCoreIdentityPanel.svelte`
- `src/modules/bible/components/FactionCulturePanel.svelte`

Changes in batch 23:

- Replaced bible section collapse-toggle local controls with canonical `GhostButton` primitives.
- Preserved collapse semantics and existing field-edit behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 23):

- `pnpm exec eslint src/modules/bible/components/FactionCoreIdentityPanel.svelte src/modules/bible/components/FactionCulturePanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 24 Implemented

- `src/modules/bible/components/FactionContinuityPanel.svelte`
- `src/modules/bible/components/VoicePanel.svelte`

Changes in batch 24:

- Replaced bible section collapse-toggle local controls with canonical `GhostButton` primitives.
- Preserved collapse semantics and existing field-edit behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 24):

- `pnpm exec eslint src/modules/bible/components/FactionContinuityPanel.svelte src/modules/bible/components/VoicePanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 25 Implemented

- `src/modules/bible/components/CharacterCorePanel.svelte`
- `src/modules/bible/components/ContinuityPanel.svelte`

Changes in batch 25:

- Replaced bible section collapse-toggle local controls with canonical `GhostButton` primitives.
- Preserved collapse semantics and existing field-edit behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 25):

- `pnpm exec eslint src/modules/bible/components/CharacterCorePanel.svelte src/modules/bible/components/ContinuityPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 26 Implemented

- `src/modules/bible/components/LineageCoreIdentityPanel.svelte`
- `src/modules/bible/components/LineageContinuityPanel.svelte`

Changes in batch 26:

- Replaced bible section collapse-toggle local controls with canonical `GhostButton` primitives.
- Preserved collapse semantics and existing field-edit behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 26):

- `pnpm exec eslint src/modules/bible/components/LineageCoreIdentityPanel.svelte src/modules/bible/components/LineageContinuityPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 27 Implemented

- `src/modules/bible/components/LineageCurrentStatePanel.svelte`
- `src/modules/bible/components/LineageStoryFunctionPanel.svelte`

Changes in batch 27:

- Replaced bible section collapse-toggle local controls with canonical `GhostButton` primitives.
- Preserved collapse semantics and existing field-edit behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 27):

- `pnpm exec eslint src/modules/bible/components/LineageCurrentStatePanel.svelte src/modules/bible/components/LineageStoryFunctionPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 28 Implemented

- `src/modules/bible/components/FactionCurrentStatePanel.svelte`
- `src/modules/bible/components/FactionStoryFunctionPanel.svelte`

Changes in batch 28:

- Replaced bible section collapse-toggle local controls with canonical `GhostButton` primitives.
- Preserved collapse semantics and existing field-edit behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 28):

- `pnpm exec eslint src/modules/bible/components/FactionCurrentStatePanel.svelte src/modules/bible/components/FactionStoryFunctionPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 29 Implemented

- `src/modules/bible/components/FactionMembersPanel.svelte`
- `src/modules/bible/components/LineageMembersPanel.svelte`

Changes in batch 29:

- Replaced bible section collapse-toggle local controls with canonical `GhostButton` primitives.
- Preserved collapse semantics and existing field-edit behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 29):

- `pnpm exec eslint src/modules/bible/components/FactionMembersPanel.svelte src/modules/bible/components/LineageMembersPanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 30 Implemented

- `src/modules/bible/components/StoryFunctionPanel.svelte`
- `src/modules/bible/components/LineageInheritanceCulturePanel.svelte`

Changes in batch 30:

- Replaced bible section collapse-toggle local controls with canonical `GhostButton` primitives.
- Preserved collapse semantics and existing field-edit behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 30):

- `pnpm exec eslint src/modules/bible/components/StoryFunctionPanel.svelte src/modules/bible/components/LineageInheritanceCulturePanel.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 31 Implemented

- `src/modules/bible/components/LandmarkForm.svelte`
- `src/modules/bible/components/RealmForm.svelte`

Changes in batch 31:

- Replaced all remaining multi-section realm/landmark collapse-toggle local controls with canonical `GhostButton` primitives.
- Preserved collapse semantics and existing autosave-driven form behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 31):

- `pnpm exec eslint src/modules/bible/components/LandmarkForm.svelte src/modules/bible/components/RealmForm.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 32 Implemented

- `src/modules/bible/components/IndividualsWorkspaceShell.svelte`
- `src/modules/bible/components/CharacterAssetLinker.svelte`

Changes in batch 32:

- Replaced local non-toggle action controls with canonical `GhostButton` primitives.
- Preserved selection/create/dropzone interaction semantics and existing update behavior.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 32):

- `pnpm exec eslint src/modules/bible/components/IndividualsWorkspaceShell.svelte src/modules/bible/components/CharacterAssetLinker.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 33 Implemented

- `src/modules/bible/components/RelationshipEditor.svelte`
- `src/modules/bible/components/CharacterSelect.svelte`
- `src/modules/bible/components/IndividualsDossier.svelte`

Changes in batch 33:

- Replaced remaining local bible action/select controls with canonical `GhostButton` primitives.
- Preserved relationship add/remove/select behavior and persona list/drawer interaction semantics.
- Updated class selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 33):

- `pnpm exec eslint src/modules/bible/components/RelationshipEditor.svelte src/modules/bible/components/CharacterSelect.svelte src/modules/bible/components/IndividualsDossier.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Batch 34 Implemented

- `src/modules/settings/components/ThemeSelector.svelte`
- `src/modules/assets/components/ImageGrid.svelte`

Changes in batch 34:

- Replaced final native module-local action buttons with canonical `GhostButton` primitives.
- Preserved theme toggle behavior and asset card selection/open actions.
- Updated selectors to `:global(...)` where styling must cross primitive wrappers.

Validation snapshot (batch 34):

- `pnpm exec eslint src/modules/settings/components/ThemeSelector.svelte src/modules/assets/components/ImageGrid.svelte` ✅
- `pnpm run check` ✅ (0 errors, 0 warnings)
- `pnpm run check:tokens` ✅ (0 violations)

## Sweep Closure Evidence

- Residual scan: `grep -R "<button" src/modules --include='*.svelte'` produced no native button matches.
- Final gate run:
  - `pnpm run lint` ✅
  - `pnpm run check` ✅ (0 errors, 0 warnings)
  - `pnpm run check:tokens` ✅ (0 violations)
  - `pnpm run test` ✅ (39 files, 261 tests)
- Reviewer-requested accessibility remediation applied in `src/modules/assets/components/ImageGrid.svelte`:
  - Keyboard-focusable upload triggers.
  - Keyboard/Escape modal dismissal handling.
  - Accessible labels for assignment selects.
- Post-remediation validation:
  - `pnpm exec eslint src/modules/assets/components/ImageGrid.svelte src/modules/settings/components/ThemeSelector.svelte` ✅
  - `pnpm run check` ✅ (0 errors, 0 warnings)
  - `pnpm run check:tokens` ✅ (0 violations)
  - `pnpm run test` ✅ (39 files, 261 tests)
- Final reviewer remediation (modal semantics, cover alt binding, close-button accessible name) applied in `src/modules/assets/components/ImageGrid.svelte`.
- Validation after final remediation:
  - `pnpm exec eslint src/modules/assets/components/ImageGrid.svelte` ✅
  - `pnpm run check` ✅ (0 errors, 0 warnings)
  - `pnpm run check:tokens` ✅ (0 violations)
  - `pnpm run test` ✅ (39 files, 261 tests)

Progress note: interactive-primitives button convergence sweep is complete for module-local native button variants.

Rationale: remaining bible section toggles follow the same low-risk local pattern with direct canonical mapping to `GhostButton`.
