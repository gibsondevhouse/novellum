// Proxy barrel — re-exports the public API of the outliner module.
// Workspace is the product name for the story planning surface.
export * from '../outliner/index.js';

// Workspace-specific types and stores
export type { WorkspaceMode, StatusOption, BeatWithStages, MilestoneWithChapters } from './types.js';
export { WORKSPACE_MODES, WORKSPACE_MODE_LABELS } from './types.js';
export { ARC_STATUSES, STAGE_STATUSES, ARC_TYPES } from './constants.js';
export { createBeat, createStage, createMilestoneEntity } from './factories.js';
export { computeCompletionPercent } from './utils.js';
export {
	getActiveMode,
	getSelectedId,
	getActiveSelectedId,
	setMode,
	nextMode,
	prevMode,
	selectItem,
	resetSelections,
} from './stores/workspace-mode.svelte.js';
export type { WorkspaceData } from './services/workspace-data-service.js';
export { getWorkspaceData } from './services/workspace-data-service.js';

// Components — generic shell
export { default as WorkspaceBoardShell } from './components/WorkspaceBoardShell.svelte';

// Components — arc-specific
export { default as ArcHeader } from './components/ArcHeader.svelte';
export { default as ArcWorkspace } from './components/ArcWorkspace.svelte';
export { default as BeatCard } from './components/BeatCard.svelte';
export { default as StageCard } from './components/StageCard.svelte';
export { default as StatusDotDropdown } from './components/StatusDotDropdown.svelte';

// Components — act-specific
export { default as ActHeader } from './components/ActHeader.svelte';
export { default as ActsWorkspace } from './components/ActsWorkspace.svelte';
export { default as MilestoneCard } from './components/MilestoneCard.svelte';

// Components — chapter-specific
export { default as ChapterHeader } from './components/ChapterHeader.svelte';
export { default as ChaptersWorkspace } from './components/ChaptersWorkspace.svelte';
export { default as SceneCard } from './components/SceneCard.svelte';
