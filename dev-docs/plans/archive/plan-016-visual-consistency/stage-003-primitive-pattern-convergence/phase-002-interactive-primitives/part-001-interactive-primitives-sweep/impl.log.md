---
part: part-001-interactive-primitives-sweep
---

# Implementation Log

> Append entries chronologically. Never edit or delete existing entries.
> Format: `### [YYYY-MM-DD HH:MM] Agent: [[Agent Name]]`

---

## [2026-04-24 19:20] Agent: [Copilot]

- Started `part-001-interactive-primitives-sweep`; moved stage/phase/part to `in-progress`.
- Generated initial candidate inventory using module-wide grep scans for local button/input/textarea/pill/tab patterns.
- Implemented first conversion slice:
  - `src/modules/outliner/components/AddChapterForm.svelte`
  - `src/modules/outliner/components/AddSceneForm.svelte`
- Migration in this slice replaced local action buttons with canonical `PrimaryButton` / `GhostButton` while preserving keyboard submit/cancel behavior.
- Validation queued for touched slice (type-check/lint/tokens).

## [2026-04-24 19:45] Agent: [Copilot]

- Implemented interactive-primitives batch 2 in outliner controls:
  - `src/modules/outliner/components/OutlineEmptyState.svelte`
  - `src/modules/outliner/components/BeatItem.svelte`
- Replaced local `<button>` variants with canonical button primitives (`PrimaryButton` / `GhostButton`).
- Converted class selectors to `:global(...)` where required so component-class styling remains effective through primitive wrappers.
- Preserved existing a11y behavior (`aria-label`, keyboard focus visibility, and existing confirmation flow on destructive action).

## [2026-04-24 20:05] Agent: [Copilot]

- Implemented interactive-primitives batch 3:
  - `src/modules/assets/components/ImageGrid.svelte`
- Migrated dialog and action controls from local button classes (`btn-primary`, `btn-ghost`, `btn-danger`, `close-btn`) to canonical primitives (`PrimaryButton`, `GhostButton`, `DestructiveButton`).
- Preserved modal semantics and interaction flows (close dialog, assign, confirm delete, cancel delete).
- Maintained styling by converting wrapper-dependent close-button selectors to `:global(...)`.
- Validation passed for the touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 20:20] Agent: [Copilot]

- Implemented interactive-primitives batch 4:
  - `src/modules/outliner/components/ArcTagHint.svelte`
  - `src/modules/outliner/components/BeatList.svelte`
- Migrated local hint/add buttons to canonical `GhostButton` while preserving existing add/select behavior.
- Updated selector scoping with `:global(...)` where component-class hooks needed to pass through primitive boundaries.
- Validation queued for the touched slice.

## [2026-04-24 20:35] Agent: [Copilot]

- Implemented interactive-primitives batch 5:
  - `src/modules/project/components/DeleteProjectDialog.svelte`
- Replaced local destructive button with canonical `DestructiveButton` while preserving delete flow and disabled/loading behavior.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 20:50] Agent: [Copilot]

- Implemented interactive-primitives batch 6:
  - `src/modules/project/components/ProjectCreateCard.svelte`
- Replaced local close and advanced-toggle button implementations with canonical `GhostButton` primitives.
- Preserved modal behavior and disclosure semantics (`aria-expanded`, `aria-controls`, and close flow).
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 21:05] Agent: [Copilot]

- Implemented interactive-primitives batch 7:
  - `src/modules/project/components/HubDetailsPanel.svelte`
- Replaced local target-edit trigger button (`details-val-btn`) with canonical `GhostButton`.
- Preserved target editing flow and keyboard interactions for Enter/Escape in the input path.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 21:20] Agent: [Copilot]

- Implemented interactive-primitives batch 8:
  - `src/modules/project/components/ProjectHeroContent.svelte`
  - `src/modules/project/components/ProjectHeroSynopsis.svelte`
- Replaced local confirm/cancel and empty-state button variants with canonical `GhostButton` primitives.
- Preserved inline-edit behavior and keyboard interactions (Escape cancel path, Enter confirm path on active inputs).
- Applied `:global(...)` selector targeting for class hooks on primitive-wrapped controls.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 21:30] Agent: [Copilot]

- Implemented interactive-primitives batch 9:
  - `src/modules/project/components/ProjectCard.svelte`
- Replaced local card action button (`card-btn`) with canonical `GhostButton` while preserving project-selection behavior.
- Updated style selector scoping with `:global(...)` so card button class hooks apply through the primitive wrapper.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 21:45] Agent: [Copilot]

- Implemented interactive-primitives batch 10:
  - `src/modules/export/components/ExportModal.svelte`
  - `src/modules/ai/components/SuggestionChips.svelte`
- Replaced local format-tab/chip button variants with canonical `GhostButton` primitives.
- Preserved existing interaction semantics:
  - `ExportModal` format controls keep `radiogroup` + `role="radio"` behavior.
  - `SuggestionChips` selection callback flow remains unchanged.
- Applied `:global(...)` selector targeting where class-based styling hooks must cross primitive wrappers.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 21:55] Agent: [Copilot]

- Implemented interactive-primitives batch 11:
  - `src/modules/project/components/ProjectCreateCard.svelte`
- Replaced the backdrop dismiss control from a non-semantic hidden button to a presentation backdrop layer, preserving click-to-dismiss behavior.
- Preserved modal dialog semantics and retained canonical action primitives for close/cancel/submit controls.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 22:10] Agent: [Copilot]

- Implemented interactive-primitives batch 12:
  - `src/modules/project/components/ProjectAdvancedFields.svelte`
  - `src/modules/project/components/ProjectStoryFields.svelte`
- Replaced local preset/disclosure button variants with canonical `GhostButton` primitives.
- Preserved disclosure and selection semantics (`aria-expanded`, `aria-controls`, `aria-pressed`) and existing handlers.
- Applied `:global(...)` selector targeting where class-based hooks cross primitive wrappers.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 22:25] Agent: [Copilot]

- Implemented interactive-primitives batch 13:
  - `src/modules/project/components/ProjectHeroCover.svelte`
  - `src/modules/project/components/ProjectCoreFields.svelte`
  - `src/modules/ai/components/PromptInput.svelte`
- Replaced local utility/action controls with canonical `GhostButton` primitives.
- Preserved control semantics and handlers (`aria-*` labels/states, remove actions, context-menu actions, send trigger behavior).
- Applied `:global(...)` selector targeting for class-based style hooks crossing primitive wrappers.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 22:40] Agent: [Copilot]

- Implemented interactive-primitives batch 14:
  - `src/modules/project/components/BookCoverCard.svelte`
  - `src/modules/ai/components/ChatInterface.svelte`
- Replaced remaining local project/ai module picker/card action buttons with canonical `GhostButton` primitives.
- Preserved project-reader open behavior and project-picker interaction flows (close, attach toggle, done).
- Applied `:global(...)` selector targeting and replaced invalid class-directive patterns on component instances with explicit class strings.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 22:55] Agent: [Copilot]

- Implemented interactive-primitives batch 15:
  - `src/modules/outliner/components/SceneClarityPanel.svelte`
  - `src/modules/outliner/components/ChapterOutlinePanel.svelte`
  - `src/modules/editor/components/VersionHistoryPanel.svelte`
- Replaced local outliner/editor beat, list, and utility action buttons with canonical `GhostButton` primitives.
- Preserved behavior flows and semantics for beat ordering/removal/addition, beat focus opening, version selection, and restore/close actions.
- Applied `:global(...)` selector targeting where class hooks need to pass through primitive wrappers; replaced component class directives with explicit class strings where needed.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 23:10] Agent: [Copilot]

- Implemented interactive-primitives batch 16:
  - `src/modules/outliner/components/SceneRow.svelte`
  - `src/modules/outliner/components/ChapterGroup.svelte`
  - `src/modules/editor/components/ManuscriptSurface.svelte`
- Replaced local row/action and editor toolbar bubble controls with canonical `GhostButton` primitives.
- Preserved scene/chapter select-edit-delete flows and text-formatting command behavior in the manuscript bubble menu.
- Updated selectors to `:global(...)` for primitive wrapper compatibility and replaced component-incompatible class directives with explicit class strings.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 23:25] Agent: [Copilot]

- Implemented interactive-primitives batch 17:
  - `src/modules/outliner/components/ActPlanningPanel.svelte`
  - `src/modules/outliner/components/ActClarityPanel.svelte`
  - `src/modules/editor/components/EditModeToolbar.svelte`
- Replaced local act/editor control buttons with canonical `GhostButton` primitives.
- Preserved act title edit/delete behavior, chapter row disclosure behavior, and edit mode selection behavior.
- Updated selector scoping to `:global(...)` and replaced component-incompatible class directives with explicit class strings where required.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 23:40] Agent: [Copilot]

- Implemented interactive-primitives batch 18:
  - `src/modules/outliner/components/OutlineDetailCard.svelte`
  - `src/modules/outliner/components/ActGroup.svelte`
  - `src/modules/outliner/components/ChapterClarityPanel.svelte`
- Replaced remaining queued outliner local controls with canonical `GhostButton` primitives.
- Preserved panel close/overlay close behavior, act expand/select behavior, and chapter add-scene behavior.
- Updated wrapper-scoped selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-24 23:55] Agent: [Copilot]

- Implemented interactive-primitives batch 19:
  - `src/modules/outliner/components/beats/BeatOverlay.svelte`
  - `src/modules/outliner/components/beats/BeatNumberField.svelte`
- Replaced the final residual outliner/editor local beat control buttons with canonical `GhostButton` primitives.
- Preserved save and delete behavior, including keyboard/blur flows and inline beat-control visibility behavior.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 00:10] Agent: [Copilot]

- Implemented interactive-primitives batch 20:
  - `src/modules/consistency/components/IssueRow.svelte`
  - `src/modules/continuity/components/PromptEditor.svelte`
- Replaced local consistency/continuity action controls with canonical primitives (`GhostButton`, `PrimaryButton`).
- Preserved issue action semantics (`resolve`, `dismiss`, `reopen`) and prompt save/disabled behavior.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 00:22] Agent: [Copilot]

- Implemented interactive-primitives batch 21:
  - `src/modules/bible/components/RelationshipPanel.svelte`
  - `src/modules/bible/components/FactionRelationshipPanel.svelte`
- Replaced local relationship panel controls with canonical `GhostButton` primitives.
- Preserved collapse/create/save/cancel/remove behavior and existing relationship form flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 00:34] Agent: [Copilot]

- Implemented interactive-primitives batch 22:
  - `src/modules/bible/components/LineageRelationshipPanel.svelte`
  - `src/modules/bible/components/NarrativeStatePanel.svelte`
- Replaced remaining local lineage relationship and narrative-state collapse controls with canonical `GhostButton` primitives.
- Preserved collapse/create/save/cancel/remove behavior and existing field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 00:45] Agent: [Copilot]

- Implemented interactive-primitives batch 23:
  - `src/modules/bible/components/FactionCoreIdentityPanel.svelte`
  - `src/modules/bible/components/FactionCulturePanel.svelte`
- Replaced bible section collapse-toggle controls with canonical `GhostButton` primitives.
- Preserved collapse behavior and existing field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 00:57] Agent: [Copilot]

- Implemented interactive-primitives batch 24:
  - `src/modules/bible/components/FactionContinuityPanel.svelte`
  - `src/modules/bible/components/VoicePanel.svelte`
- Replaced bible section collapse-toggle controls with canonical `GhostButton` primitives.
- Preserved collapse behavior and existing field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 01:08] Agent: [Copilot]

- Implemented interactive-primitives batch 25:
  - `src/modules/bible/components/CharacterCorePanel.svelte`
  - `src/modules/bible/components/ContinuityPanel.svelte`
- Replaced bible section collapse-toggle controls with canonical `GhostButton` primitives.
- Preserved collapse behavior and existing field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 01:18] Agent: [Copilot]

- Implemented interactive-primitives batch 26:
  - `src/modules/bible/components/LineageCoreIdentityPanel.svelte`
  - `src/modules/bible/components/LineageContinuityPanel.svelte`
- Replaced bible section collapse-toggle controls with canonical `GhostButton` primitives.
- Preserved collapse behavior and existing field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 01:30] Agent: [Copilot]

- Implemented interactive-primitives batch 27:
  - `src/modules/bible/components/LineageCurrentStatePanel.svelte`
  - `src/modules/bible/components/LineageStoryFunctionPanel.svelte`
- Replaced bible section collapse-toggle controls with canonical `GhostButton` primitives.
- Preserved collapse behavior and existing field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 01:42] Agent: [Copilot]

- Implemented interactive-primitives batch 28:
  - `src/modules/bible/components/FactionCurrentStatePanel.svelte`
  - `src/modules/bible/components/FactionStoryFunctionPanel.svelte`
- Replaced bible section collapse-toggle controls with canonical `GhostButton` primitives.
- Preserved collapse behavior and existing field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 01:54] Agent: [Copilot]

- Implemented interactive-primitives batch 29:
  - `src/modules/bible/components/FactionMembersPanel.svelte`
  - `src/modules/bible/components/LineageMembersPanel.svelte`
- Replaced bible section collapse-toggle controls with canonical `GhostButton` primitives.
- Preserved collapse behavior and existing field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 02:06] Agent: [Copilot]

- Implemented interactive-primitives batch 30:
  - `src/modules/bible/components/StoryFunctionPanel.svelte`
  - `src/modules/bible/components/LineageInheritanceCulturePanel.svelte`
- Replaced bible section collapse-toggle controls with canonical `GhostButton` primitives.
- Preserved collapse behavior and existing field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 02:19] Agent: [Copilot]

- Implemented interactive-primitives batch 31:
  - `src/modules/bible/components/LandmarkForm.svelte`
  - `src/modules/bible/components/RealmForm.svelte`
- Replaced all remaining realm/landmark section collapse-toggle controls with canonical `GhostButton` primitives.
- Preserved collapse behavior and existing autosave-driven field-edit flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 02:33] Agent: [Copilot]

- Implemented interactive-primitives batch 32:
  - `src/modules/bible/components/IndividualsWorkspaceShell.svelte`
  - `src/modules/bible/components/CharacterAssetLinker.svelte`
- Replaced local non-toggle action controls with canonical `GhostButton` primitives.
- Preserved selection/create/dropzone interaction behavior and existing field/update flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 02:47] Agent: [Copilot]

- Implemented interactive-primitives batch 33:
  - `src/modules/bible/components/RelationshipEditor.svelte`
  - `src/modules/bible/components/CharacterSelect.svelte`
  - `src/modules/bible/components/IndividualsDossier.svelte`
- Replaced remaining local bible action/select controls with canonical `GhostButton` primitives.
- Preserved list selection, relationship add/remove/select behavior, and existing drawer/profile interaction flows.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 22:05] Agent: [Copilot]

- Implemented interactive-primitives batch 34:
  - `src/modules/settings/components/ThemeSelector.svelte`
  - `src/modules/assets/components/ImageGrid.svelte`
- Replaced remaining native module-local action buttons with canonical `GhostButton` primitives.
- Preserved theme selection behavior, asset cover/open interactions, and selected-card semantics.
- Updated wrapper-targeted selectors to `:global(...)` for primitive compatibility.
- Validation passed for touched slice (`eslint`, `check`, `check:tokens`).

## [2026-04-25 22:07] Agent: [Copilot]

- Final residual scan: `grep -R "<button" src/modules --include='*.svelte'` returned no native button matches.
- Full gates passed for closure:
  - `pnpm run lint`
  - `pnpm run check`
  - `pnpm run check:tokens`
  - `pnpm run test` (39 files, 261 tests)
- Part moved to `review` and reviewer sign-off requested.

## [2026-04-25 22:09] Agent: [Copilot]

- Addressed reviewer a11y blockers in `src/modules/assets/components/ImageGrid.svelte`:
  - Replaced label-only upload triggers with keyboard-focusable `GhostButton` triggers + hidden file inputs.
  - Added keyboard-accessible modal-backdrop dismissal behavior and Escape handling.
  - Added accessible labels for assignment selects.
- Removed prior dialog a11y suppression comments tied to mouse-only interactions.
- Re-ran validation:
  - `pnpm exec eslint src/modules/assets/components/ImageGrid.svelte src/modules/settings/components/ThemeSelector.svelte`
  - `pnpm run check`
  - `pnpm run check:tokens`
  - `pnpm run test` (39 files, 261 tests)
- Reviewer re-sign-off requested after remediation.

## [2026-04-25 22:10] Agent: [Copilot]

- Addressed final reviewer findings in `src/modules/assets/components/ImageGrid.svelte`:
  - Removed invalid `role="button"` wrapper semantics from modal backdrop by introducing a separate backdrop-dismiss button layer.
  - Corrected cover image alt binding to interpolate album title.
  - Added explicit `aria-label` on icon-only close control.
- Re-ran validation:
  - `pnpm exec eslint src/modules/assets/components/ImageGrid.svelte`
  - `pnpm run check`
  - `pnpm run check:tokens`
  - `pnpm run test` (39 files, 261 tests)
- Reviewer sign-off requested for final completion transition.

## [2026-04-25 22:12] Agent: [Copilot]

- Reviewer sign-off received with no remaining findings.
- Part status transitioned `review` → `complete` in `part.md`.
- Parent phase status propagated to `complete`; stage phase listing updated accordingly.
