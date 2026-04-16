// Proxy barrel — re-exports the public API of the outliner module.
// Workspace is the product name for the story planning surface.
export * from '../outliner/index.js';

// Workspace-specific types and stores
export type { WorkspaceMode, StatusOption, BeatWithStages } from './types.js';
export { WORKSPACE_MODES, WORKSPACE_MODE_LABELS } from './types.js';
export { ARC_STATUSES, STAGE_STATUSES, ARC_TYPES } from './constants.js';
export { createBeat, createStage } from './factories.js';
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

// Components
export { default as ArcHeader } from './components/ArcHeader.svelte';
export { default as ArcWorkspace } from './components/ArcWorkspace.svelte';
export { default as BeatCard } from './components/BeatCard.svelte';
export { default as StageCard } from './components/StageCard.svelte';
export { default as StatusDotDropdown } from './components/StatusDotDropdown.svelte';
